from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ZJSUer Translation Assistant API"
    app_env: str = "development"
    allowed_origins: List[str] = ["http://localhost:5173"]
    database_path: str = "data/zjsuer_translation.sqlite3"
    auth_token_days: int = 14
    speech_provider: str = "mock"
    speech_max_audio_bytes: int = 3_000_000
    speech_max_text_chars: int = 50
    tencentcloud_secret_id: Optional[str] = None
    tencentcloud_secret_key: Optional[str] = None
    tencent_asr_endpoint: str = "asr.tencentcloudapi.com"
    tencent_asr_region: str = "ap-shanghai"
    tencent_asr_engine: str = "16k_zh"
    ai_provider: str = "mock"

    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-5-mini"
    openai_base_url: str = "https://api.openai.com/v1"
    openai_timeout_seconds: int = 60
    openai_max_output_tokens: int = 1200

    compatible_api_key: Optional[str] = None
    compatible_model: str = "deepseek-v4-flash"
    compatible_base_url: str = "https://api.deepseek.com"
    compatible_provider_name: str = "compatible"

    deepseek_api_key: Optional[str] = None
    deepseek_model: str = "deepseek-v4-flash"
    deepseek_base_url: str = "https://api.deepseek.com"

    qianfan_api_key: Optional[str] = None
    dashscope_api_key: Optional[str] = None
    dashscope_model: str = "qwen-plus"
    dashscope_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
