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

To enable real model calls:

```bash
cp .env.example .env
```

For the current low-cost DeepSeek setup, edit `.env`:

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

OpenAI remains supported:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-5-mini
```

The current OpenAI integration uses the Responses API and asks the model to return strict JSON for translation and polishing workflows.

For low-cost domestic testing, use an OpenAI-compatible Chat Completions provider. DeepSeek is the recommended first trial because it is cheap, simple to configure and works well for translation/polishing MVP validation:

```env
AI_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

Alibaba Cloud Model Studio / DashScope can also be used through its OpenAI-compatible endpoint:

```env
AI_PROVIDER=dashscope
DASHSCOPE_API_KEY=your_api_key
DASHSCOPE_MODEL=qwen-plus
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
```

For any other OpenAI-compatible service:

```env
AI_PROVIDER=compatible
COMPATIBLE_API_KEY=your_api_key
COMPATIBLE_MODEL=your-model
COMPATIBLE_BASE_URL=https://provider.example.com/v1
COMPATIBLE_PROVIDER_NAME=provider-name
```

## Tests

```bash
pip install -r requirements-dev.txt
pytest
```

The current pytest suite covers `/api/health`, `/api/status`, mock translation, mock deep translation, mock polishing and request validation.
