from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ZJSUer Translation Assistant API"
    app_env: str = "development"
    allowed_origins: List[str] = ["http://localhost:5173"]
    ai_provider: str = "mock"

    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-5-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    openai_timeout_seconds: int = 60
    openai_max_output_tokens: int = 1200

    qianfan_api_key: Optional[str] = None
    dashscope_api_key: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
