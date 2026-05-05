from pydantic import BaseModel, Field


class SpeechTranscribeRequest(BaseModel):
    audio_base64: str = Field(..., min_length=1)
    format: str = "wav"


class SpeechTranscribeResponse(BaseModel):
    text: str
    provider: str
    duration_ms: int = 0
