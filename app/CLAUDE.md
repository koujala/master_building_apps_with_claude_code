# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# WorkBoard backend (`app/`)

Run commands, project-wide constraints, and the definition of done are in `../CLAUDE.md`. The frontend is covered in `../static/CLAUDE.md`.

## Architecture

- Python, FastAPI, Pydantic. The tasks API lives in `main.py`. The AI assistant goes in separate modules: `ai_client.py` (Anthropic client and model settings, done) and `ai.py` (tools, agent loop and `POST /api/ai/chat`, done).
- In-memory task store: a module-level dict. Data resets on every restart, and the default sample tasks (`_DEFAULT_TASKS`) are re-seeded at import time.
- Task logic lives in `list_tasks_impl`, `create_task_impl` and `update_task_impl` in `main.py`; routes and AI tools both call them.
- API under `/api/tasks`: `GET`, `POST`, `PATCH /{id}`, `DELETE /{id}`.
- The static frontend is mounted at `/` after the API routes. Keep it last, or it will shadow `/api`.
- `Status` enum is the source of truth for task states: `planned`, `in_progress`, `testing`, `completed`. The frontend hardcodes the same values (see `../static/CLAUDE.md`). Changing a status means changing both sides, and old values are rejected with 422.
