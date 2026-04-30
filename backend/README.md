# Backend

FastAPI service for AI workflow orchestration.

## Responsibilities

- Expose translation, review, polishing and learning-record APIs.
- Load prompt templates from `../prompts`.
- Orchestrate quick mode and deep mode AI calls.
- Keep provider-specific model code behind service boundaries.

## Local Start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

Useful checks:

```bash
curl http://localhost:8000/api/health
curl http://localhost:8000/api/status
```

`/api/status` reports the active AI provider, model and whether required configuration is complete. It never returns API keys.

## AI Provider

The backend runs in `mock` mode by default, so the product prototype works without API keys.

To enable real OpenAI calls:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5-mini
```

The current OpenAI integration uses the Responses API and asks the model to return strict JSON for translation and polishing workflows.
