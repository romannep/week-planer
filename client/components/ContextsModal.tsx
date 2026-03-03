import { useState } from "react";
import { api } from "../api";
import type { Context } from "../types";
import { CONTEXT_COLORS } from "../constants/colors";
import { ContextChip } from "./ContextChip";

interface ContextsModalProps {
  contexts: Context[];
  onClose: () => void;
  onSaved: () => void;
}

type EditState = { type: "list" } | { type: "add" } | { type: "edit"; context: Context };

export function ContextsModal({ contexts, onClose, onSaved }: ContextsModalProps) {
  const [state, setState] = useState<EditState>({ type: "list" });
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(CONTEXT_COLORS[0]!);
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setName("");
    setColor(CONTEXT_COLORS[0]!);
    setState({ type: "add" });
  };

  const startEdit = (context: Context) => {
    setName(context.name);
    setColor(context.color);
    setState({ type: "edit", context });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      if (state.type === "add") {
        await api.contexts.create({ name: trimmed, color });
      } else if (state.type === "edit") {
        await api.contexts.update(state.context.id, { name: trimmed, color });
      }
      onSaved();
      setState({ type: "list" });
    } finally {
      setSaving(false);
    }
  };

  if (state.type === "add" || state.type === "edit") {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label={state.type === "add" ? "Новый контекст" : "Редактировать контекст"}
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
        onClick={(e) => e.target === e.currentTarget && setState({ type: "list" })}
      >
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            maxWidth: 400,
            width: "100%",
            padding: 24,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 600 }}>
            {state.type === "add" ? "Новый контекст" : "Редактировать контекст"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="context-name"
                style={{ display: "block", marginBottom: 6, fontSize: 14 }}
              >
                Название *
              </label>
              <input
                id="context-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Например: Работа"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  fontSize: 16,
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <span style={{ display: "block", marginBottom: 8, fontSize: 14 }}>Цвет</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CONTEXT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    title={c}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: color === c ? "2px solid var(--text)" : "2px solid transparent",
                      background: c,
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setState({ type: "list" })}
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
                disabled={!name.trim() || saving}
                style={{
                  padding: "10px 16px",
                  border: "none",
                  borderRadius: "var(--radius)",
                  background: "var(--accent)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {saving ? "Сохранение…" : "Сохранить"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Контексты"
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
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Контексты</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 10px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              fontSize: 14,
              color: "var(--text-muted)",
            }}
          >
            Закрыть
          </button>
        </div>
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {contexts.map((ctx) => (
            <li
              key={ctx.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
                gap: 12,
              }}
            >
              <ContextChip context={ctx} />
              <button
                type="button"
                onClick={() => startEdit(ctx)}
                style={{
                  padding: "6px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  background: "var(--surface)",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Изменить
              </button>
            </li>
          ))}
        </ul>
        {contexts.length === 0 && (
          <p style={{ color: "var(--text-muted)", margin: "16px 0" }}>
            Нет контекстов. Добавьте первый.
          </p>
        )}
        <button
          type="button"
          onClick={startAdd}
          style={{
            marginTop: 16,
            padding: "10px 16px",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--accent)",
            cursor: "pointer",
            width: "100%",
            fontSize: 14,
          }}
        >
          + Добавить контекст
        </button>
      </div>
    </div>
  );
}
