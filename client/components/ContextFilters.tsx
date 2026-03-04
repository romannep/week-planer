import type { Context } from "../types";

interface ContextFiltersProps {
  contexts: Context[];
  selectedContextId: number | null;
  onSelect: (contextId: number | null) => void;
  /** В шапке без нижнего отступа */
  inline?: boolean;
}

export function ContextFilters({
  contexts,
  selectedContextId,
  onSelect,
  inline,
}: ContextFiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 8,
        marginBottom: inline ? 0 : 16,
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(null)}
        style={{
          padding: "6px 12px",
          borderRadius: 999,
          border: `2px solid ${selectedContextId === null ? "var(--accent)" : "var(--border)"}`,
          background: selectedContextId === null ? "var(--accent-soft)" : "var(--surface)",
          color: selectedContextId === null ? "var(--accent)" : "var(--text)",
          fontSize: 13,
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Все
      </button>
      {contexts.map((ctx) => (
        <button
          key={ctx.id}
          type="button"
          onClick={() => onSelect(selectedContextId === ctx.id ? null : ctx.id)}
          style={{
            padding: "6px 12px",
            borderRadius: 999,
            border: `2px solid ${ctx.color}`,
            background: selectedContextId === ctx.id ? ctx.color : "var(--surface)",
            color: selectedContextId === ctx.id ? "#fff" : "var(--text)",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {ctx.name}
        </button>
      ))}
    </div>
  );
}
