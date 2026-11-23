# WorkBoard

A small Kanban board. A FastAPI backend serves the REST API and a no-build vanilla JS frontend, with an AI assistant powered by Claude.

## Tech Stack

### Backend

| Tech | Version | Role |
|---|---|---|
| Python | 3.14 (requires >= 3.11) | Language |
| FastAPI | 0.162.7 | Web framework and REST API under `/api` |
| Pydantic | 2.14.3 | Request/response models and validation |
| Starlette | 1.10.0 | ASGI toolkit under FastAPI; serves the static frontend |
| Uvicorn | 0.54.0 | ASGI server |
| Anthropic SDK | 2.12.0 | Calls Claude for the AI assistant |
| python-dotenv | 1.2.4 | Loads `ANTHROPIC_API_KEY` from `.env` |

- Storage is an in-memory Python dict: no database, data resets on restart and sample tasks are re-seeded.
- The AI assistant uses `claude-sonnet-5-5` and has no delete tool.
- Dev only: `pytest`, `httpx`.

### Frontend

- HTML5, vanilla JavaScript (ES modules), modern CSS (custom properties, `light-dark()`, `color-mix()`, grid, flexbox)
- HTML5 Drag and Drop API for moving cards between columns
- Poppins typeface from Google Fonts
- No framework, bundler, transpiler or build step

### Tooling

| Tool | Role |
|---|---|
| [uv](https://docs.astral.sh/uv/) | Python environment and dependency management (`pyproject.toml`, `uv.lock`). **Required** |
| Node.js / npm | Optional. Only runs the `npm run dev` / `npm start` shortcuts; no npm dependencies |
| Git / TortoiseGit | Optional. Version control and Windows Explorer GUI |
| Claude Code | AI coding assistant; guidance in `CLAUDE.md`, `app/CLAUDE.md`, `static/CLAUDE.md` |

## Getting Started

1. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`. The key is read on the server only and must never be committed.
2. Run the app:

   ```
   uv run uvicorn app.main:app --reload
   ```

   or `npm run dev`, which wraps the same command.
3. Open http://127.0.0.1:8000

## Not Used

Frontend frameworks, Docker, a database, authentication, and any dependency beyond those listed above.

See [TECH_STACK.md](TECH_STACK.md) for the full details.
