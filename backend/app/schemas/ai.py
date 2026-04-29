from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class TranslationMode(str, Enum):
    quick = "quick"
    deep = "deep"


class HealthResponse(BaseModel):
    status: str


class TranslateRequest(BaseModel):
    text: str = Field(..., min_length=1)
    source_language: str = "auto"
    target_language: str = "English"
    mode: TranslationMode = TranslationMode.quick
    context: Optional[str] = None


class TranslateResponse(BaseModel):
    mode: TranslationMode
    translation: str
    review: Optional[str] = None
    suggestions: List[str] = Field(default_factory=list)
    prompt_keys: List[str] = Field(default_factory=list)
    provider: str = "mock"
    model: Optional[str] = None


class PolishRequest(BaseModel):
    text: str = Field(..., min_length=1)
    target_language: str = "English"
    goal: str = "grammar_and_style"
    context: Optional[str] = None


class PolishResponse(BaseModel):
    polished_text: str
    changes: List[str]
    prompt_keys: List[str] = Field(default_factory=list)
    provider: str = "mock"
    model: Optional[str] = None
