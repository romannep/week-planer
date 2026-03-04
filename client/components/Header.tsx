import type { Calendar, Context, User } from "../types";
import { ContextFilters } from "./ContextFilters";

type Theme = "default" | "blue" | "minimal";

interface HeaderProps {
  user: User;
  onLogout: () => void;
  viewMode: "week" | "day";
  year: number;
  week: number;
  focusedDateLabel: string | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  onToday: () => void;
  onToggleFocus: () => void;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  calendars: Calendar[];
  activeCalendarId: number;
  onCalendarChange: (id: number) => void;
  contexts: Context[];
  selectedContextId: number | null;
  onContextSelect: (id: number | null) => void;
  onOpenContexts: () => void;
}

export function Header({
  user,
  onLogout,
  viewMode,
  year,
  week,
  focusedDateLabel,
  onPrevWeek,
  onNextWeek,
  onPrevDay,
  onNextDay,
  onToday,
  onToggleFocus,
  theme,
  onThemeChange,
  calendars,
  activeCalendarId,
  onCalendarChange,
  contexts,
  selectedContextId,
  onContextSelect,
  onOpenContexts,
}: HeaderProps) {
  const weekLabel = `Неделя ${week}, ${year}`;
  const navLabel = viewMode === "day" ? focusedDateLabel : weekLabel;
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "12px 16px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
        boxShadow: "var(--shadow)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {viewMode === "week" ? (
          <button
            type="button"
            onClick={onPrevWeek}
            aria-label="Предыдущая неделя"
            style={navBtnStyle}
          >
            ‹
          </button>
        ) : (
          <button
            type="button"
            onClick={onPrevDay}
            aria-label="Предыдущий день"
            style={navBtnStyle}
          >
            ‹
          </button>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 200, justifyContent: "center" }}>
          <button type="button" onClick={onToday} style={{ ...btnStyle, fontWeight: 500 }}>
            Сегодня
          </button>
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "1.1rem" }}>
            {navLabel}
          </span>
        </div>
        {viewMode === "week" ? (
          <button
            type="button"
            onClick={onNextWeek}
            aria-label="Следующая неделя"
            style={navBtnStyle}
          >
            ›
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextDay}
            aria-label="Следующий день"
            style={navBtnStyle}
          >
            ›
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onToggleFocus}
        title={viewMode === "week" ? "Дневной вид (фокус)" : "Недельный вид"}
        style={{
          ...btnStyle,
          padding: "8px 14px",
          fontSize: 14,
          background: viewMode === "day" ? "var(--accent-soft)" : "transparent",
          color: viewMode === "day" ? "var(--accent)" : "var(--text)",
        }}
      >
        Фокус
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginRight: 4 }}>
        <ContextFilters
          contexts={contexts}
          selectedContextId={selectedContextId}
          onSelect={onContextSelect}
          inline
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {calendars.length > 1 && (
          <select
            value={activeCalendarId}
            onChange={(e) => onCalendarChange(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text)",
              fontFamily: "inherit",
            }}
          >
            {calendars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={onOpenContexts}
          title="Контексты"
          aria-label="Контексты"
          style={{ ...btnStyle, padding: "8px 14px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </button>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{user.login}</span>
        <button type="button" onClick={onLogout} style={{ ...btnStyle, padding: "6px 12px", fontSize: 14 }}>
          Выйти
        </button>
        {(["default", "blue", "minimal"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onThemeChange(t)}
            title={t === "default" ? "Бумага" : t === "blue" ? "Синяя" : "Минимализм"}
            style={{
              ...btnStyle,
              padding: "6px 10px",
              fontSize: 12,
              background: theme === t ? "var(--accent-soft)" : "transparent",
              color: theme === t ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {t === "default" ? "Бумага" : t === "blue" ? "Синяя" : "Мин."}
          </button>
        ))}
      </div>
    </header>
  );
}

const btnStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "var(--text)",
  padding: 6,
  borderRadius: "var(--radius)",
  fontSize: 18,
};

const navBtnStyle: React.CSSProperties = {
  ...btnStyle,
  padding: "14px 20px",
  fontSize: 28,
  minWidth: 52,
};
