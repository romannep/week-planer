import { useState, useEffect } from "react";
import type { Context, Task } from "../types";

interface TaskModalProps {
  task: Task | null;
  contexts: Context[];
  defaultDate?: string;
  onSave: (data: {
    title: string;
    notes?: string | null;
    date?: string | null;
    contextId?: number | null;
    recurringRule?: Task["recurringRule"];
  }) => void;
  onDelete?: () => void;
  onClose: () => void;
}

const RECURRING_OPTIONS: { value: Task["recurringRule"]; label: string }[] = [
  { value: "none", label: "Не повторять" },
  { value: "daily", label: "Каждый день" },
  { value: "weekly", label: "Каждую неделю" },
  { value: "monthly", label: "Каждый месяц" },
  { value: "yearly", label: "Каждый год" },
];

export function TaskModal({
  task,
  contexts,
  defaultDate,
  onSave,
  onDelete,
  onClose,
}: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [date, setDate] = useState(task?.date ?? defaultDate ?? "");
  const [contextId, setContextId] = useState<number | null>(task?.contextId ?? null);
  const [recurringRule, setRecurringRule] = useState<Task["recurringRule"]>(
    task?.recurringRule ?? "none"
  );

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes ?? "");
      setDate(task.date ?? "");
      setContextId(task.contextId);
      setRecurringRule(task.recurringRule);
    } else {
      setTitle("");
      setNotes("");
      setDate(defaultDate ?? "");
      setContextId(null);
      setRecurringRule("none");
    }
  }, [task, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onSave({
      title: t,
      notes: notes.trim() || null,
      date: date.trim() || null,
      contextId,
      recurringRule,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={task ? "Редактировать задачу" : "Новая задача"}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: 16,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
          maxWidth: 440,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>
            {task ? "Редактировать задачу" : "Новая задача"}
          </h2>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="task-title" style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              Название *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
              placeholder="Что сделать?"
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: 16,
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="task-notes" style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              Заметки
            </label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Дополнительно..."
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                resize: "vertical",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label htmlFor="task-date" style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              Дата (оставьте пустым для «Когда-нибудь»)
            </label>
            <input
              id="task-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: "block", marginBottom: 8, fontSize: 14 }}>Контекст</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button
                type="button"
                onClick={() => setContextId(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: `2px solid ${contextId === null ? "var(--accent)" : "var(--border)"}`,
                  background: contextId === null ? "var(--accent-soft)" : "var(--surface)",
                  color: contextId === null ? "var(--accent)" : "var(--text)",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Без контекста
              </button>
              {contexts.map((ctx) => (
                <button
                  key={ctx.id}
                  type="button"
                  onClick={() => setContextId(ctx.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `2px solid ${ctx.color}`,
                    background: contextId === ctx.id ? ctx.color : "var(--surface)",
                    color: contextId === ctx.id ? "#fff" : "var(--text)",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {ctx.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 24, display: "none" }}>
            <label htmlFor="task-recurring" style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              Повтор
            </label>
            <select
              id="task-recurring"
              value={recurringRule}
              onChange={(e) => setRecurringRule(e.target.value as Task["recurringRule"])}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
              }}
            >
              {RECURRING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            <div>
              {onDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  style={{
                    padding: "10px 16px",
                    border: "none",
                    background: "transparent",
                    color: "#c62828",
                    cursor: "pointer",
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "10px 16px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--surface)",
                  cursor: "pointer",
                }}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "var(--radius)",
                  background: "var(--accent)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
