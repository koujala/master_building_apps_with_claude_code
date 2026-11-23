from enum import Enum
from itertools import count
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from app.ai import router as ai_router

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


class Status(str, Enum):
    planned = "planned"
    in_progress = "in_progress"
    testing = "testing"
    completed = "completed"


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    status: Status = Status.planned


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    status: Status | None = None


class Task(BaseModel):
    id: int
    title: str
    status: Status


app = FastAPI(title="WorkBoard")

_tasks: dict[int, Task] = {}
_ids = count(1)

_DEFAULT_TASKS = [
    ("Define business case approval workflow", Status.planned),
    ("Plan quarterly benefits realization review", Status.planned),
    ("Map stakeholder sign-off matrix", Status.planned),
    ("Draft business case template", Status.in_progress),
    ("Build ROI and NPV calculation model", Status.in_progress),
    ("Consolidate cost and benefit assumptions", Status.in_progress),
    ("Validate financial model with Finance", Status.testing),
    ("Pilot approval workflow with PMO", Status.testing),
    ("Gather business requirements from sponsors", Status.completed),
    ("Identify and prioritize business cases", Status.completed),
    ("Approve project charter and scope", Status.completed),
]
for _title, _status in _DEFAULT_TASKS:
    _task = Task(id=next(_ids), title=_title, status=_status)
    _tasks[_task.id] = _task


def list_tasks_impl(status: Status | None = None) -> list[Task]:
    return [t for t in _tasks.values() if status is None or t.status == status]


def create_task_impl(title: str, status: Status = Status.planned) -> Task:
    title = title.strip()
    if not title:
        raise ValueError("title must not be blank")
    if len(title) > 200:
        raise ValueError("title must be at most 200 characters")
    task = Task(id=next(_ids), title=title, status=status)
    _tasks[task.id] = task
    return task


def update_task_impl(task_id: int, title: str | None = None, status: Status | None = None) -> Task:
    task = _tasks.get(task_id)
    if task is None:
        raise LookupError("task not found")
    if title is not None:
        title = title.strip()
        if not title:
            raise ValueError("title must not be blank")
        if len(title) > 200:
            raise ValueError("title must be at most 200 characters")
        task.title = title
    if status is not None:
        task.status = status
    return task


@app.get("/api/tasks")
def list_tasks() -> list[Task]:
    return list_tasks_impl()


@app.post("/api/tasks", status_code=201)
def create_task(body: TaskCreate) -> Task:
    try:
        return create_task_impl(body.title, body.status)
    except ValueError as exc:
        raise HTTPException(422, str(exc))


@app.patch("/api/tasks/{task_id}")
def update_task(task_id: int, body: TaskUpdate) -> Task:
    try:
        return update_task_impl(task_id, body.title, body.status)
    except LookupError as exc:
        raise HTTPException(404, str(exc))
    except ValueError as exc:
        raise HTTPException(422, str(exc))


@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: int) -> None:
    if _tasks.pop(task_id, None) is None:
        raise HTTPException(404, "task not found")


app.include_router(ai_router)  # before the static mount, which must stay last
app.mount("/",StaticFiles(directory=STATIC_DIR, html=True), name="static")
