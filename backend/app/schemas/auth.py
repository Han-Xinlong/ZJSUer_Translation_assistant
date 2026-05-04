from typing import Any, Dict, List

from pydantic import BaseModel, Field, field_validator


class UserPublic(BaseModel):
    id: int
    email: str
    display_name: str


class AuthRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6, max_length=128)
    display_name: str = Field(default="", max_length=40)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class LoginRequest(BaseModel):
    email: str
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


class LearningState(BaseModel):
    history: List[Dict[str, Any]] = Field(default_factory=list)
    expressions: List[Dict[str, Any]] = Field(default_factory=list)
    improvements: List[Dict[str, Any]] = Field(default_factory=list)
    community_posts: List[Dict[str, Any]] = Field(default_factory=list)
    goals: Dict[str, Any] = Field(default_factory=dict)


def normalize_email(value: str) -> str:
    normalized = value.strip().lower()
    if "@" not in normalized or "." not in normalized.rsplit("@", 1)[-1]:
        raise ValueError("请输入有效邮箱地址。")
    return normalized
