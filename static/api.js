async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (typeof body.detail === "string") detail = body.detail;
    } catch {}
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export const listTasks = () => request("/tasks");

export const createTask = (title) =>
  request("/tasks", { method: "POST", body: JSON.stringify({ title }) });

export const updateTask = (id, changes) =>
  request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(changes) });

export const deleteTask = (id) => request(`/tasks/${id}`, { method: "DELETE" });
