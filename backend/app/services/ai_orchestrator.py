from app.schemas.ai import (
    PolishRequest,
    PolishResponse,
    TranslateRequest,
    TranslateResponse,
    TranslationMode,
)
from app.services.ai_provider import MockProvider, create_ai_provider
from app.services.prompt_loader import PromptLoader


class AIOrchestrator:
    """Coordinates quick translation, deep translation and polishing workflows."""

    def __init__(self) -> None:
        self.prompts = PromptLoader()
        self.provider = None

    def translate(self, payload: TranslateRequest) -> TranslateResponse:
        provider = self._get_provider()
        if isinstance(provider, MockProvider):
            return self._mock_translate(payload)

        if payload.mode == TranslationMode.deep:
            return self._deep_translate(payload)

        return self._quick_translate(payload)

    def polish(self, payload: PolishRequest) -> PolishResponse:
        provider = self._get_provider()
        if isinstance(provider, MockProvider):
            return self._mock_polish(payload)

        result = provider.complete_json(
            instructions=self.prompts.load("polish"),
            prompt=self._build_polish_prompt(payload),
        )
        return PolishResponse(
            polished_text=str(result.data.get("polished_text", payload.text)),
            changes=self._as_string_list(result.data.get("changes")),
            prompt_keys=["polish"],
            provider=result.provider,
            model=result.model,
        )

    def _quick_translate(self, payload: TranslateRequest) -> TranslateResponse:
        provider = self._get_provider()
        result = provider.complete_json(
            instructions=self.prompts.load("quick_translate"),
            prompt=self._build_translate_prompt(payload),
        )
        return TranslateResponse(
            mode=payload.mode,
            translation=str(result.data.get("translation", "")),
            suggestions=self._as_string_list(result.data.get("suggestions")),
            prompt_keys=["quick_translate"],
            provider=result.provider,
            model=result.model,
        )

    def _deep_translate(self, payload: TranslateRequest) -> TranslateResponse:
        provider = self._get_provider()
        initial = provider.complete_json(
            instructions=self.prompts.load("deep_translate_initial"),
            prompt=self._build_translate_prompt(payload),
        )
        review = provider.complete_json(
            instructions=self.prompts.load("deep_translate_review"),
            prompt=self._build_review_prompt(payload, initial.data),
        )
        return TranslateResponse(
            mode=payload.mode,
            translation=str(
                review.data.get("final_translation")
                or review.data.get("translation")
                or initial.data.get("translation")
                or ""
            ),
            review=str(review.data.get("review") or review.data.get("summary") or ""),
            suggestions=self._as_string_list(
                review.data.get("suggestions")
                or review.data.get("expressions")
                or initial.data.get("key_choices")
            ),
            prompt_keys=["deep_translate_initial", "deep_translate_review"],
            provider=review.provider,
            model=review.model,
        )

    def _mock_translate(self, payload: TranslateRequest) -> TranslateResponse:
        if payload.mode == TranslationMode.deep:
            return TranslateResponse(
                mode=payload.mode,
                translation=f"[Initial translation placeholder] {payload.text}",
                review="Deep mode will run initial translation, review, then produce a final version.",
                suggestions=[
                    "Check domain context before final translation.",
                    "Compare the reviewed version with the learner's original wording.",
                ],
                prompt_keys=["deep_translate_initial", "deep_translate_review"],
            )
        return TranslateResponse(
            mode=payload.mode,
            translation=f"[Quick translation placeholder] {payload.text}",
            suggestions=["Use quick mode for immediate lookup and short sentence translation."],
            prompt_keys=["quick_translate"],
        )

    def _mock_polish(self, payload: PolishRequest) -> PolishResponse:
        return PolishResponse(
            polished_text=f"[Polished placeholder] {payload.text}",
            changes=[
                "Grammar, style and expression explanations will be generated here.",
                "Each change should be saved into the learner's review record.",
            ],
            prompt_keys=["polish"],
        )

    def _build_translate_prompt(self, payload: TranslateRequest) -> str:
        return (
            f"Source language: {payload.source_language}\n"
            f"Target language: {payload.target_language}\n"
            f"Context: {payload.context or 'N/A'}\n"
            f"Text:\n{payload.text}\n\n"
            "Return only valid JSON. Required shape:\n"
            '{"translation": "string", "suggestions": ["string"]}'
        )

    def _build_review_prompt(self, payload: TranslateRequest, initial: dict) -> str:
        return (
            f"Source language: {payload.source_language}\n"
            f"Target language: {payload.target_language}\n"
            f"Context: {payload.context or 'N/A'}\n"
            f"Source text:\n{payload.text}\n\n"
            f"Initial translation JSON:\n{initial}\n\n"
            "Return only valid JSON. Required shape:\n"
            '{"final_translation": "string", "review": "string", "suggestions": ["string"]}'
        )

    def _build_polish_prompt(self, payload: PolishRequest) -> str:
        return (
            f"Target language: {payload.target_language}\n"
            f"Goal: {payload.goal}\n"
            f"Context: {payload.context or 'N/A'}\n"
            f"Text:\n{payload.text}\n\n"
            "Return only valid JSON. Required shape:\n"
            '{"polished_text": "string", "changes": ["string"]}'
        )

    def _as_string_list(self, value) -> list:
        if value is None:
            return []
        if isinstance(value, list):
            return [str(item) for item in value if str(item).strip()]
        return [str(value)]

    def _get_provider(self):
        if self.provider is None:
            self.provider = create_ai_provider()
        return self.provider
