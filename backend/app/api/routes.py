from fastapi import APIRouter, HTTPException

from app.schemas.ai import (
    HealthResponse,
    PolishRequest,
    PolishResponse,
    StatusResponse,
    TranslateRequest,
    TranslateResponse,
)
from app.core.config import settings
from app.services.ai_orchestrator import AIOrchestrator
from app.services.ai_provider import AIProviderConfigurationError, AIProviderError


router = APIRouter()
orchestrator = AIOrchestrator()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


@router.get("/status", response_model=StatusResponse)
def service_status() -> StatusResponse:
    provider = settings.ai_provider.lower().strip()
    model = None
    configured = True
    message = "AI service is ready."

    if provider == "openai":
        model = settings.openai_model
        configured = bool(settings.openai_api_key)
        message = (
            "OpenAI provider is configured."
            if configured
            else "OpenAI provider is selected, but OPENAI_API_KEY is missing."
        )
    elif provider == "mock":
        model = "mock"
        message = "Mock provider is active. No API key is required."
    else:
        configured = False
        message = f"Unsupported AI_PROVIDER: {settings.ai_provider}"

    return StatusResponse(
        status="ok" if configured else "degraded",
        provider=provider,
        model=model,
        configured=configured,
        message=message,
    )


@router.post("/translate", response_model=TranslateResponse)
def translate(payload: TranslateRequest) -> TranslateResponse:
    try:
        return orchestrator.translate(payload)
    except AIProviderConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("/polish", response_model=PolishResponse)
def polish(payload: PolishRequest) -> PolishResponse:
    try:
        return orchestrator.polish(payload)
    except AIProviderConfigurationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
