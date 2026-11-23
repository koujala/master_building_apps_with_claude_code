// Chat panel: posts the conversation to /api/ai/chat and reads the SSE stream.

export function initChat({ onBoardChange }) {
  const panel = document.getElementById("chat");
  const toggle = document.getElementById("chat-toggle");
  const log = document.getElementById("chat-log");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const send = form.querySelector("button");

  const messages = []; // {role, content} plain text; the server is stateless
  let busy = false;

  function setOpen(open) {
    panel.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
  }
  toggle.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
  document.getElementById("chat-close").addEventListener("click", () => setOpen(false));
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  function bubble(kind, text = "") {
    const el = document.createElement("div");
    el.className = `msg ${kind}`;
    el.textContent = text;
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  }

  function activity(event) {
    const { name, input: args, result } = event;
    const el = document.createElement("div");
    el.className = "msg activity";
    if (result.error) {
      el.classList.add("failed");
      el.textContent = `${name} failed: ${result.error}`;
    } else if (name === "list_tasks") {
      el.textContent = `Listed ${result.tasks.length} task(s)`;
    } else if (name === "create_task") {
      el.textContent = `Created "${result.title}"`;
      el.dataset.status = result.status;
    } else if (name === "move_task") {
      el.textContent = `Moved "${result.title}" to ${result.status.replace("_", " ")}`;
      el.dataset.status = result.status;
    } else {
      el.textContent = `Renamed task ${args.task_id} to "${result.title}"`;
    }
    log.append(el);
    log.scrollTop = log.scrollHeight;
  }

  function setBusy(value) {
    busy = value;
    input.disabled = value;
    send.disabled = value;
    panel.classList.toggle("busy", value);
    if (!value) input.focus();
  }

  async function readStream(response, assistantEl, handlers) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let end;
      while ((end = buffer.indexOf("\n\n")) !== -1) {
        const raw = buffer.slice(0, end);
        buffer = buffer.slice(end + 2);
        let event = "message";
        let data = "";
        for (const line of raw.split("\n")) {
          if (line.startsWith("event: ")) event = line.slice(7);
          else if (line.startsWith("data: ")) data += line.slice(6);
        }
        if (data) handlers[event]?.(JSON.parse(data));
      }
    }
  }

  async function sendMessage(text) {
    messages.push({ role: "user", content: text });
    bubble("user", text);
    setBusy(true);

    let assistantEl = null;
    let reply = "";
    let failed = false;
    const handlers = {
      text: ({ delta }) => {
        if (!assistantEl && !delta.trim()) return; // skip the separator between model calls
        assistantEl ??= bubble("assistant");
        reply += delta;
        assistantEl.textContent = reply;
        log.scrollTop = log.scrollHeight;
      },
      tool: (event) => {
        assistantEl = null; // next text starts a fresh bubble after the activity line
        reply = "";
        activity(event);
        onBoardChange();
      },
      error: ({ message }) => {
        failed = true;
        bubble("error", message);
      },
    };

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      await readStream(response, assistantEl, handlers);
    } catch (err) {
      failed = true;
      bubble("error", err.message);
    } finally {
      // Keep only turns the server would accept: drop the failed exchange's empty reply.
      if (assistantEl && reply.trim() && !failed) messages.push({ role: "assistant", content: reply });
      if (failed) messages.pop(); // let the user retry the same message
      setBusy(false);
      onBoardChange();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text || busy) return;
    input.value = "";
    sendMessage(text);
  });

  for (const chip of document.querySelectorAll("#chat-chips button")) {
    chip.addEventListener("click", () => {
      if (!busy) sendMessage(chip.textContent);
    });
  }
}
