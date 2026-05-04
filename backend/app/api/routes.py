from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.schemas.ai import (
    HealthResponse,
    PolishRequest,
    PolishResponse,
    StatusResponse,
    TranslateRequest,
    TranslateResponse,
)
from app.schemas.auth import AuthRequest, AuthResponse, LearningState, LoginRequest, UserPublic
from app.core.config import settings
from app.services.ai_orchestrator import AIOrchestrator
from app.services.ai_provider import AIProviderConfigurationError, AIProviderError
from app.services.user_store import DuplicateUserError, InvalidCredentialsError, user_store


router = APIRouter()
orchestrator = AIOrchestrator()


def current_user(authorization: str = Header(default="")) -> UserPublic:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="请先登录后再使用个人学习数据。",
        )

    user = user_store.get_user_by_token(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="登录状态已过期，请重新登录。",
        )
    return user


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
    elif provider == "deepseek":
        model = settings.deepseek_model
        configured = bool(settings.deepseek_api_key)
        message = (
            "DeepSeek provider is configured."
            if configured
            else "DeepSeek provider is selected, but DEEPSEEK_API_KEY is missing."
        )
    elif provider == "dashscope":
        model = settings.dashscope_model
        configured = bool(settings.dashscope_api_key)
        message = (
            "DashScope provider is configured."
            if configured
            else "DashScope provider is selected, but DASHSCOPE_API_KEY is missing."
        )
    elif provider == "compatible":
        model = settings.compatible_model
        configured = bool(settings.compatible_api_key)
        message = (
            f"{settings.compatible_provider_name} provider is configured."
            if configured
            else "Compatible provider is selected, but COMPATIBLE_API_KEY is missing."
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


@router.post("/auth/register", response_model=AuthResponse)
def register(payload: AuthRequest) -> AuthResponse:
    try:
        token, user = user_store.create_user(
            email=str(payload.email),
            password=payload.password,
            display_name=payload.display_name,
        )
    except DuplicateUserError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    return AuthResponse(token=token, user=user)


@router.post("/auth/login", response_model=AuthResponse)
def login(payload: LoginRequest) -> AuthResponse:
    try:
        token, user = user_store.authenticate(str(payload.email), payload.password)
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    return AuthResponse(token=token, user=user)


@router.get("/auth/me", response_model=UserPublic)
def me(user: UserPublic = Depends(current_user)) -> UserPublic:
    return user


@router.post("/auth/logout")
def logout(authorization: str = Header(default="")) -> dict:
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() == "bearer" and token:
        user_store.delete_session(token)
    return {"status": "ok"}


@router.get("/learning-state", response_model=LearningState)
def get_learning_state(user: UserPublic = Depends(current_user)) -> LearningState:
    return user_store.get_learning_state(user.id)


@router.put("/learning-state", response_model=LearningState)
def save_learning_state(payload: LearningState, user: UserPublic = Depends(current_user)) -> LearningState:
    return user_store.save_learning_state(user.id, payload)


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
