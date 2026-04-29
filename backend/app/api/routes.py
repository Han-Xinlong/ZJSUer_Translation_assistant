from fastapi import APIRouter, HTTPException

from app.schemas.ai import (
    HealthResponse,
    PolishRequest,
    PolishResponse,
    TranslateRequest,
    TranslateResponse,
)
from app.services.ai_orchestrator import AIOrchestrator
from app.services.ai_provider import AIProviderConfigurationError, AIProviderError


router = APIRouter()
orchestrator = AIOrchestrator()


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status="ok")


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
