# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# WorkBoard frontend (`static/`)

Served by FastAPI at `/`. Run commands and project-wide constraints are in `../CLAUDE.md`; the backend is in `../app/CLAUDE.md`.

## Architecture

- HTML, vanilla JS (ES modules), modern CSS. No build step.
- `api.js` wraps `fetch` for the `/api/tasks` endpoints. `main.js` renders the board and wires up the UI. `chat.js` is the AI chat panel (streams `/api/ai/chat` SSE, refreshes the board on each tool event and when the stream ends). After every action it re-fetches and re-renders, so the server is the source of truth.
- Moving a task: the ← / → buttons and drag-and-drop both call `PATCH /api/tasks/{id}` with a new `status`.

## Task states

The four states must stay in sync across these places, and with the `Status` enum in `../app/main.py`:

- `STATUSES` and `LABELS` in `main.js`
- the four `<section class="column" data-status="...">` blocks in `index.html`
- the `[data-status="..."]` color rules and `--planned` / `--in-progress` / `--testing` / `--completed` tokens in `style.css`

State colors come from a single `--dot` custom property set by `[data-status]`. Columns, cards and move buttons all inherit or set it, so setting `data-status` on an element is what colors it.

## Branding

Aparajitha: purple `#662D91`, gold `#FDC02D`, deep indigo header, Poppins (loaded from Google Fonts). Use the existing `--brand`, `--brand-deep`, `--gold` tokens.
