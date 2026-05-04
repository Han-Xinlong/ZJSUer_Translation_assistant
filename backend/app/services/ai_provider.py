import json
from dataclasses import dataclass
from typing import Any, Dict, Optional

import httpx

from app.core.config import settings


class AIProviderError(RuntimeError):
    pass


class AIProviderConfigurationError(AIProviderError):
    pass


@dataclass
class AIProviderResult:
    data: Dict[str, Any]
    provider: str
    model: Optional[str] = None


class MockProvider:
    provider_name = "mock"

    def complete_json(self, instructions: str, prompt: str) -> AIProviderResult:
        return AIProviderResult(data={}, provider=self.provider_name)


class OpenAIProvider:
    provider_name = "openai"

    def __init__(self) -> None:
        if not settings.openai_api_key:
            raise AIProviderConfigurationError(
                "OPENAI_API_KEY is required when AI_PROVIDER=openai."
            )

        self.model = settings.openai_model
        self.base_url = settings.openai_base_url.rstrip("/")
        self.timeout = settings.openai_timeout_seconds

    def complete_json(self, instructions: str, prompt: str) -> AIProviderResult:
        payload = {
            "model": self.model,
            "instructions": instructions,
            "input": prompt,
            "max_output_tokens": settings.openai_max_output_tokens,
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(
                    f"{self.base_url}/responses",
                    headers={
                        "Authorization": f"Bearer {settings.openai_api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:600]
            raise AIProviderError(f"OpenAI API request failed: {detail}") from exc
        except httpx.HTTPError as exc:
            raise AIProviderError(f"OpenAI API request failed: {exc}") from exc

        text = self._extract_text(response.json())
        return AIProviderResult(
            data=self._parse_json(text),
            provider=self.provider_name,
            model=self.model,
        )

    def _extract_text(self, payload: Dict[str, Any]) -> str:
        if payload.get("output_text"):
            return str(payload["output_text"])

        chunks = []
        for output in payload.get("output", []):
            for content in output.get("content", []):
                if content.get("type") in {"output_text", "text"} and content.get("text"):
                    chunks.append(content["text"])

        if chunks:
            return "\n".join(chunks)

        raise AIProviderError("OpenAI API response did not include text output.")

    def _parse_json(self, text: str) -> Dict[str, Any]:
        return parse_json_object(text)


class ChatCompletionsProvider:
    def __init__(
        self,
        provider_name: str,
        api_key: Optional[str],
        model: str,
        base_url: str,
    ) -> None:
        if not api_key:
            raise AIProviderConfigurationError(
                f"{provider_name.upper()} API key is required when AI_PROVIDER={provider_name}."
            )

        self.provider_name = provider_name
        self.api_key = api_key
        self.model = model
        self.base_url = base_url.rstrip("/")
        self.timeout = settings.openai_timeout_seconds

    def complete_json(self, instructions: str, prompt: str) -> AIProviderResult:
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": instructions},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.2,
            "max_tokens": settings.openai_max_output_tokens,
            "response_format": {"type": "json_object"},
        }

        try:
            with httpx.Client(timeout=self.timeout) as client:
                response = client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = exc.response.text[:600]
            raise AIProviderError(f"{self.provider_name} API request failed: {detail}") from exc
        except httpx.HTTPError as exc:
            raise AIProviderError(f"{self.provider_name} API request failed: {exc}") from exc

        text = self._extract_text(response.json())
        return AIProviderResult(
            data=self._parse_json(text),
            provider=self.provider_name,
            model=self.model,
        )

    def _extract_text(self, payload: Dict[str, Any]) -> str:
        choices = payload.get("choices", [])
        if not choices:
            raise AIProviderError(f"{self.provider_name} API response did not include choices.")

        message = choices[0].get("message", {})
        content = message.get("content")
        if not content:
            raise AIProviderError(f"{self.provider_name} API response did not include text output.")

        if isinstance(content, list):
            chunks = [
                str(item.get("text") or item.get("content") or "")
                for item in content
                if isinstance(item, dict)
            ]
            content = "\n".join(chunk for chunk in chunks if chunk)

        return str(content)

    def _parse_json(self, text: str) -> Dict[str, Any]:
        return parse_json_object(text)


def parse_json_object(text: str) -> Dict[str, Any]:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines and lines[0].strip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    candidates = [cleaned]
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start != -1 and end != -1 and start < end:
        candidates.append(cleaned[start : end + 1])

    for candidate in candidates:
        try:
            value = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
        raise AIProviderError("Model JSON output must be an object.")

    preview = text[:600]
    raise AIProviderError(
        "AI 返回内容暂时无法解析。请补充语境说明，或稍后重试；"
        f"原始片段：{preview}"
    )


def create_ai_provider():
    provider = settings.ai_provider.lower().strip()
    if provider == "openai":
        return OpenAIProvider()
    if provider == "deepseek":
        return ChatCompletionsProvider(
            provider_name="deepseek",
            api_key=settings.deepseek_api_key,
            model=settings.deepseek_model,
            base_url=settings.deepseek_base_url,
        )
    if provider == "dashscope":
        return ChatCompletionsProvider(
            provider_name="dashscope",
            api_key=settings.dashscope_api_key,
            model=settings.dashscope_model,
            base_url=settings.dashscope_base_url,
        )
    if provider == "compatible":
        return ChatCompletionsProvider(
            provider_name=settings.compatible_provider_name,
            api_key=settings.compatible_api_key,
            model=settings.compatible_model,
            base_url=settings.compatible_base_url,
        )
    if provider == "mock":
        return MockProvider()
    raise AIProviderConfigurationError(f"Unsupported AI_PROVIDER: {settings.ai_provider}")
