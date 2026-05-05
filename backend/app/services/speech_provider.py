import base64
import hashlib
import hmac
import json
import time
from dataclasses import dataclass
from typing import Any, Dict

import httpx

from app.core.config import settings


class SpeechRecognitionError(RuntimeError):
    pass


class SpeechRecognitionConfigurationError(SpeechRecognitionError):
    pass


@dataclass
class SpeechRecognitionResult:
    text: str
    provider: str
    duration_ms: int = 0


def transcribe_chinese(audio_base64: str, audio_format: str = "wav") -> SpeechRecognitionResult:
    provider = settings.speech_provider.lower().strip()
    audio_bytes = _decode_audio(audio_base64)
    if len(audio_bytes) > settings.speech_max_audio_bytes:
        raise SpeechRecognitionError("语音文件过大，请控制在 10 秒以内后重试。")

    if provider == "mock":
        return SpeechRecognitionResult(
            text="这是一段中文语音识别演示文本。",
            provider="mock",
            duration_ms=0,
        )
    if provider == "tencent":
        return _TencentAsrProvider().transcribe(audio_bytes, audio_format)
    raise SpeechRecognitionConfigurationError(f"Unsupported SPEECH_PROVIDER: {settings.speech_provider}")


def _decode_audio(audio_base64: str) -> bytes:
    try:
        return base64.b64decode(audio_base64, validate=True)
    except ValueError as exc:
        raise SpeechRecognitionError("语音数据格式无效，请重新录音。") from exc


class _TencentAsrProvider:
    service = "asr"
    version = "2019-06-14"
    action = "SentenceRecognition"

    def __init__(self) -> None:
        if not settings.tencentcloud_secret_id or not settings.tencentcloud_secret_key:
            raise SpeechRecognitionConfigurationError(
                "SPEECH_PROVIDER=tencent requires TENCENTCLOUD_SECRET_ID and TENCENTCLOUD_SECRET_KEY."
            )
        self.endpoint = settings.tencent_asr_endpoint
        self.region = settings.tencent_asr_region

    def transcribe(self, audio_bytes: bytes, audio_format: str) -> SpeechRecognitionResult:
        voice_format = audio_format.lower().strip() or "wav"
        if voice_format not in {"wav", "mp3", "m4a", "aac", "ogg"}:
            raise SpeechRecognitionError("当前语音格式暂不支持，请重新录音。")

        body = {
            "ProjectId": 0,
            "SubServiceType": 2,
            "EngSerViceType": settings.tencent_asr_engine,
            "SourceType": 1,
            "VoiceFormat": voice_format,
            "Data": base64.b64encode(audio_bytes).decode("utf-8"),
            "DataLen": len(audio_bytes),
            "FilterPunc": 0,
            "ConvertNumMode": 1,
        }
        response = self._post(body)
        payload = response.get("Response", {})
        if payload.get("Error"):
            error = payload["Error"]
            raise SpeechRecognitionError(
                f"腾讯云语音识别失败：{error.get('Message') or error.get('Code') or '未知错误'}"
            )

        text = str(payload.get("Result") or "").strip()
        if not text:
            raise SpeechRecognitionError("没有识别到清晰中文语音，请靠近麦克风后重试。")

        return SpeechRecognitionResult(
            text=text[: settings.speech_max_text_chars],
            provider="tencent",
            duration_ms=int(payload.get("AudioDuration") or 0),
        )

    def _post(self, body: Dict[str, Any]) -> Dict[str, Any]:
        timestamp = int(time.time())
        body_json = json.dumps(body, separators=(",", ":"), ensure_ascii=False)
        headers = self._build_headers(body_json, timestamp)
        try:
            with httpx.Client(timeout=20) as client:
                response = client.post(f"https://{self.endpoint}", headers=headers, content=body_json.encode("utf-8"))
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise SpeechRecognitionError(f"腾讯云语音识别请求失败：{exc}") from exc
        return response.json()

    def _build_headers(self, body_json: str, timestamp: int) -> Dict[str, str]:
        canonical_headers = f"content-type:application/json; charset=utf-8\nhost:{self.endpoint}\n"
        signed_headers = "content-type;host"
        hashed_request_payload = hashlib.sha256(body_json.encode("utf-8")).hexdigest()
        canonical_request = "\n".join(
            [
                "POST",
                "/",
                "",
                canonical_headers,
                signed_headers,
                hashed_request_payload,
            ]
        )

        date = time.strftime("%Y-%m-%d", time.gmtime(timestamp))
        credential_scope = f"{date}/{self.service}/tc3_request"
        hashed_canonical_request = hashlib.sha256(canonical_request.encode("utf-8")).hexdigest()
        string_to_sign = "\n".join(
            [
                "TC3-HMAC-SHA256",
                str(timestamp),
                credential_scope,
                hashed_canonical_request,
            ]
        )
        signature = self._sign_string(date, string_to_sign)
        authorization = (
            "TC3-HMAC-SHA256 "
            f"Credential={settings.tencentcloud_secret_id}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, Signature={signature}"
        )

        return {
            "Authorization": authorization,
            "Content-Type": "application/json; charset=utf-8",
            "Host": self.endpoint,
            "X-TC-Action": self.action,
            "X-TC-Timestamp": str(timestamp),
            "X-TC-Version": self.version,
            "X-TC-Region": self.region,
        }

    def _sign_string(self, date: str, string_to_sign: str) -> str:
        secret_date = _hmac_sha256(("TC3" + settings.tencentcloud_secret_key).encode("utf-8"), date)
        secret_service = _hmac_sha256(secret_date, self.service)
        secret_signing = _hmac_sha256(secret_service, "tc3_request")
        return hmac.new(secret_signing, string_to_sign.encode("utf-8"), hashlib.sha256).hexdigest()


def _hmac_sha256(key: bytes, message: str) -> bytes:
    return hmac.new(key, message.encode("utf-8"), hashlib.sha256).digest()
