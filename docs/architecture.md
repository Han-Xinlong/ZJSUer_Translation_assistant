# Architecture

The project follows the technical route described in the proposal:

- Frontend lightweight single-page application.
- Backend service layer with FastAPI.
- AI workflow orchestration behind backend APIs.
- Local-first learning data, with optional cloud backup in later stages.

## High-Level Flow

```text
User
  -> Frontend writing workspace
  -> FastAPI backend
  -> AI orchestrator
  -> Prompt templates
  -> Model provider API
  -> Translation / polishing / review result
  -> Local learning record
```

## Frontend Modules

- Writing workspace.
- Quick/deep translation controls.
- Polishing and revision panel.
- Learning heatmap and history views.
- Error bank and expression bank.

## Backend Modules

- API routes define stable contracts for the frontend.
- Schemas keep request and response formats explicit.
- Services orchestrate AI workflows and provider integrations.
- Provider adapters isolate model vendors from product workflows. Current adapters support `mock`, OpenAI Responses API, DeepSeek, DashScope and generic OpenAI-compatible Chat Completions services.
- Data layer will support SQLite/local sync experiments.

## Data Principles

- Store user learning records locally by default.
- Sync only after explicit consent.
- Keep model prompts and provider credentials out of committed code.
