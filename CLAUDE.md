# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# WorkBoard

Small Kanban board. FastAPI serves the API and the static frontend.

Folder-specific guidance lives next to the code: `app/CLAUDE.md` (backend) and `static/CLAUDE.md` (frontend).

## Commands

- Run: `uv run uvicorn app.main:app --reload` (or `npm run dev`, which wraps the same command)
- Open: http://127.0.0.1:8000

## Constraints

- No frontend frameworks, Docker, database, or auth.
- Python dependencies are limited to `fastapi`, `uvicorn`, and, for the AI assistant, `anthropic` and `python-dotenv`. Dev only: `pytest` and `httpx`. Add nothing else without asking.
- The API key lives in `.env` (never committed) and is read on the server only. It must never reach the browser, a log or a response.
- The AI assistant has no delete tool.
- Keep changes minimal. Do not refactor unrelated code.

## Definition of done

- Server starts. API endpoints verified. UI behavior checked in browser.
