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
        cleaned = text.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            cleaned = cleaned.removeprefix("json").strip()

        try:
            value = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise AIProviderError(f"Model returned non-JSON output: {text[:600]}") from exc

        if not isinstance(value, dict):
            raise AIProviderError("Model JSON output must be an object.")
        return value


def create_ai_provider():
    provider = settings.ai_provider.lower().strip()
    if provider == "openai":
        return OpenAIProvider()
    if provider == "mock":
        return MockProvider()
    raise AIProviderConfigurationError(f"Unsupported AI_PROVIDER: {settings.ai_provider}")
