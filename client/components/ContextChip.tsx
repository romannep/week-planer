import type { Context } from "../types";

interface ContextChipProps {
  context: Context;
  small?: boolean;
}

export function ContextChip({ context, small }: ContextChipProps) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: small ? "2px 8px" : "4px 10px",
        borderRadius: 999,
        border: `2px solid ${context.color}`,
        background: "var(--surface)",
        color: "var(--text)",
        fontSize: small ? 11 : 12,
        fontWeight: 500,
      }}
    >
      {context.name}
    </span>
  );
}
