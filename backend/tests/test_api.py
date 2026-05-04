from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.services.ai_provider import parse_json_object


client = TestClient(app)


def test_health_check_returns_ok():
    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_status_reports_default_mock_provider():
    response = client.get("/api/status")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "provider": "mock",
        "model": "mock",
        "configured": True,
        "message": "Mock provider is active. No API key is required.",
    }


def test_status_reports_deepseek_configuration(monkeypatch):
    monkeypatch.setattr(settings, "ai_provider", "deepseek")
    monkeypatch.setattr(settings, "deepseek_api_key", "test-key")
    monkeypatch.setattr(settings, "deepseek_model", "deepseek-v4-flash")

    response = client.get("/api/status")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "provider": "deepseek",
        "model": "deepseek-v4-flash",
        "configured": True,
        "message": "DeepSeek provider is configured.",
    }


def test_status_reports_missing_compatible_key(monkeypatch):
    monkeypatch.setattr(settings, "ai_provider", "compatible")
    monkeypatch.setattr(settings, "compatible_api_key", None)
    monkeypatch.setattr(settings, "compatible_model", "qwen-plus")
    monkeypatch.setattr(settings, "compatible_provider_name", "custom-ai")

    response = client.get("/api/status")

    assert response.status_code == 200
    assert response.json() == {
        "status": "degraded",
        "provider": "compatible",
        "model": "qwen-plus",
        "configured": False,
        "message": "Compatible provider is selected, but COMPATIBLE_API_KEY is missing.",
    }


def test_quick_translate_uses_mock_provider():
    response = client.post(
        "/api/translate",
        json={
            "text": "我想练习校园生活表达。",
            "target_language": "English",
            "mode": "quick",
            "context": "课程作业",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "quick"
    assert payload["translation"] == "[Quick translation placeholder] 我想练习校园生活表达。"
    assert payload["provider"] == "mock"
    assert payload["model"] is None
    assert payload["prompt_keys"] == ["quick_translate"]
    assert payload["suggestions"] == [
        "Use quick mode for immediate lookup and short sentence translation."
    ]


def test_deep_translate_returns_review_and_prompt_chain():
    response = client.post(
        "/api/translate",
        json={
            "text": "学习外语不只是背单词。",
            "target_language": "English",
            "mode": "deep",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "deep"
    assert payload["translation"] == "[Initial translation placeholder] 学习外语不只是背单词。"
    assert payload["review"] == "Deep mode will run initial translation, review, then produce a final version."
    assert payload["provider"] == "mock"
    assert payload["prompt_keys"] == [
        "deep_translate_initial",
        "deep_translate_review",
    ]


def test_polish_uses_mock_provider():
    response = client.post(
        "/api/polish",
        json={
            "text": "This course let me think more about language and culture.",
            "target_language": "English",
            "context": "formal reflection",
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["polished_text"] == (
        "[Polished placeholder] This course let me think more about language and culture."
    )
    assert payload["provider"] == "mock"
    assert payload["model"] is None
    assert payload["prompt_keys"] == ["polish"]
    assert payload["changes"] == [
        "Grammar, style and expression explanations will be generated here.",
        "Each change should be saved into the learner's review record.",
    ]


def test_translate_rejects_empty_text():
    response = client.post(
        "/api/translate",
        json={
            "text": "",
            "target_language": "English",
            "mode": "quick",
        },
    )

    assert response.status_code == 422


def test_parse_json_object_accepts_fenced_or_prefaced_output():
    assert parse_json_object('```json\n{"translation": "hello"}\n```') == {
        "translation": "hello"
    }
    assert parse_json_object('Here is the JSON:\n{"translation": "hello"}') == {
        "translation": "hello"
    }


def test_register_login_and_learning_state_roundtrip():
    email = "student-auth-test@example.com"
    password = "secret123"

    response = client.post(
        "/api/auth/register",
        json={
            "email": email,
            "password": password,
            "display_name": "测试同学",
        },
    )

    if response.status_code == 409:
        response = client.post(
            "/api/auth/login",
            json={
                "email": email,
                "password": password,
            },
        )

    assert response.status_code == 200
    payload = response.json()
    token = payload["token"]
    assert payload["user"]["email"] == email
    assert payload["user"]["display_name"] == "测试同学"

    state = {
        "history": [{"id": "history-1", "text": "hello"}],
        "expressions": [{"id": "expression-1", "text": "find my rhythm"}],
        "improvements": [{"id": "improvement-1", "text": "avoid literal translation"}],
        "community_posts": [{"id": "community-1", "text": "shared"}],
        "goals": {"dailyTarget": 5},
    }
    save_response = client.put(
        "/api/learning-state",
        headers={"Authorization": f"Bearer {token}"},
        json=state,
    )

    assert save_response.status_code == 200
    get_response = client.get(
        "/api/learning-state",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert get_response.status_code == 200
    assert get_response.json() == state
