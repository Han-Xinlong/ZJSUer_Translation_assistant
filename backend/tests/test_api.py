from fastapi.testclient import TestClient

from app.main import app


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
