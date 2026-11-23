import { listTasks, createTask, updateTask, deleteTask } from "./api.js";
import { initChat } from "./chat.js";

const STATUSES = ["planned", "in_progress", "testing", "completed"];
const LABELS = { planned: "Planned", in_progress: "In-Progress", testing: "Testing", completed: "Completed" };

const lists = Object.fromEntries(
  STATUSES.map((s) => [s, document.querySelector(`.column[data-status="${s}"] ul`)]),
);
const form = document.getElementById("add-form");
const input = document.getElementById("add-title");
const errorBox = document.getElementById("error");
let errorTimer;

function showError(err) {
  errorBox.textContent = err.message;
  errorBox.hidden = false;
  clearTimeout(errorTimer);
  errorTimer = setTimeout(() => (errorBox.hidden = true), 4000);
}

async function run(action) {
  try {
    await action();
    await refresh();
  } catch (err) {
    showError(err);
  }
}

function taskElement(task) {
  const li = document.createElement("li");
  li.className = "task";
  li.draggable = true;
  li.addEventListener("dragstart", (event) => {
    event.dataTransfer.setData("text/plain", String(task.id));
    event.dataTransfer.effectAllowed = "move";
    li.classList.add("dragging");
  });
  li.addEventListener("dragend", () => li.classList.remove("dragging"));

  const title = document.createElement("p");
  title.textContent = task.title;

  const actions = document.createElement("div");
  actions.className = "actions";

  const index = STATUSES.indexOf(task.status);
  for (const target of [STATUSES[index - 1], STATUSES[index + 1]]) {
    if (!target) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.status = target;
    button.textContent = target === STATUSES[index - 1] ? `← ${LABELS[target]}` : `${LABELS[target]} →`;
    button.addEventListener("click", () => run(() => updateTask(task.id, { status: target })));
    actions.append(button);
  }

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => run(() => deleteTask(task.id)));
  actions.append(remove);

  li.append(title, actions);
  return li;
}

async function refresh() {
  const tasks = await listTasks();
  for (const status of STATUSES) {
    const column = tasks.filter((t) => t.status === status);
    lists[status].replaceChildren(...column.map(taskElement));
    lists[status].closest(".column").querySelector(".count").textContent = column.length;
  }
}

for (const column of document.querySelectorAll(".column")) {
  column.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    column.classList.add("drag-over");
  });
  column.addEventListener("dragleave", (event) => {
    if (!column.contains(event.relatedTarget)) column.classList.remove("drag-over");
  });
  column.addEventListener("drop", (event) => {
    event.preventDefault();
    column.classList.remove("drag-over");
    const id = Number(event.dataTransfer.getData("text/plain"));
    if (id) run(() => updateTask(id, { status: column.dataset.status }));
  });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  run(async () => {
    await createTask(title);
    input.value = "";
  });
});

initChat({ onBoardChange: () => refresh().catch(showError) });
refresh().catch(showError);
