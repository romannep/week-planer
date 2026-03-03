import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import type { Calendar, Context, Task, User } from "./types";
import {
  addDaysToDateString,
  getWeekDays,
  getWeekNumber,
  parseDateString,
  toDateString,
} from "./utils/date";
import { ContextFilters } from "./components/ContextFilters";
import { Header } from "./components/Header";
import { WeekGrid } from "./components/WeekGrid";
import { SomedaySection } from "./components/SomedaySection";
import { ContextsModal } from "./components/ContextsModal";
import { TaskModal } from "./components/TaskModal";

type Theme = "default" | "blue" | "minimal";

interface AppProps {
  user: User;
  onLogout: () => void;
}

export function App({ user, onLogout }: AppProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const s = localStorage.getItem("weekplanner-theme");
    return (s === "blue" || s === "minimal" ? s : "default") as Theme;
  });
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [activeCalendarId, setActiveCalendarId] = useState<number>(1);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [week, setWeek] = useState(getWeekNumber(now));
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [focusedDate, setFocusedDate] = useState<string>(() => toDateString(now));
  const [weekTasks, setWeekTasks] = useState<Task[]>([]);
  const [somedayTasks, setSomedayTasks] = useState<Task[]>([]);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [selectedContextId, setSelectedContextId] = useState<number | null>(null);
  const [contextsModalOpen, setContextsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [creatingForDate, setCreatingForDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = useCallback((t: Theme) => {
    document.documentElement.setAttribute("data-theme", t === "default" ? "" : t);
    localStorage.setItem("weekplanner-theme", t);
    setTheme(t);
  }, []);

  const loadCalendars = useCallback(async () => {
    try {
      const list = await api.calendars.list();
      setCalendars(list);
      if (list.length > 0 && !list.some((c) => c.id === activeCalendarId)) {
        setActiveCalendarId(list[0]!.id);
      }
    } catch {
      setCalendars([]);
    }
  }, [activeCalendarId]);

  const loadWeek = useCallback(async () => {
    setLoading(true);
    try {
      const [weekData, someday] = await Promise.all([
        api.week.get(year, week, activeCalendarId),
        api.week.someday(activeCalendarId),
      ]);
      setWeekTasks(weekData.tasks);
      setSomedayTasks(someday);
    } catch {
      setWeekTasks([]);
      setSomedayTasks([]);
    } finally {
      setLoading(false);
    }
  }, [year, week, activeCalendarId]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "default" ? "" : theme);
  }, [theme]);

  const loadContexts = useCallback(async () => {
    try {
      const list = await api.contexts.list();
      setContexts(list);
    } catch {
      setContexts([]);
    }
  }, []);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  useEffect(() => {
    loadContexts();
  }, [loadContexts]);

  useEffect(() => {
    loadWeek();
  }, [loadWeek]);

  const refresh = useCallback(() => {
    loadWeek();
  }, [loadWeek]);

  const weekDays = getWeekDays(year, week);
  const tasksByDate = new Map<string, Task[]>();
  const filterByContext = (tasks: Task[]) =>
    selectedContextId == null
      ? tasks
      : tasks.filter((t) => t.contextId === selectedContextId);
  const filteredWeekTasks = filterByContext(weekTasks);
  const filteredSomedayTasks = filterByContext(somedayTasks);
  for (const d of weekDays) {
    tasksByDate.set(toDateString(d), []);
  }
  for (const t of filteredWeekTasks) {
    if (t.date) {
      const arr = tasksByDate.get(t.date);
      if (arr) arr.push(t);
    }
  }

  const displayDays = viewMode === "day" ? [parseDateString(focusedDate)] : weekDays;
  const tasksByDateForView =
    viewMode === "day"
      ? (() => {
          const m = new Map<string, Task[]>();
          m.set(focusedDate, tasksByDate.get(focusedDate) ?? []);
          return m;
        })()
      : tasksByDate;

  const handleTaskMove = useCallback(
    async (taskId: number, newDate: string | null, newOrder: number) => {
      try {
        await api.tasks.update(taskId, { date: newDate, orderInDay: newOrder });
        refresh();
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const handleTaskToggle = useCallback(
    async (task: Task) => {
      try {
        await api.tasks.update(task.id, { completed: !task.completed });
        refresh();
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const handleTaskDelete = useCallback(
    async (id: number) => {
      try {
        await api.tasks.delete(id);
        setEditingTask(null);
        setCreatingForDate(null);
        refresh();
      } catch {
        refresh();
      }
    },
    [refresh]
  );

  const handleTaskSave = useCallback(
    async (data: {
      title: string;
      notes?: string | null;
      date?: string | null;
      contextId?: number | null;
      recurringRule?: Task["recurringRule"];
    }) => {
      try {
        if (editingTask) {
          await api.tasks.update(editingTask.id, data);
        } else {
          await api.tasks.create({
            ...data,
            calendarId: activeCalendarId,
            date: data.date ?? creatingForDate ?? null,
          });
        }
        setEditingTask(null);
        setCreatingForDate(null);
        refresh();
      } catch {
        refresh();
      }
    },
    [editingTask, creatingForDate, activeCalendarId, refresh]
  );

  const goPrevWeek = () => {
    if (week === 1) {
      setYear((y) => y - 1);
      setWeek(53);
    } else {
      setWeek((w) => w - 1);
    }
  };

  const goNextWeek = () => {
    if (week >= 52) {
      setYear((y) => y + 1);
      setWeek(1);
    } else {
      setWeek((w) => w + 1);
    }
  };

  const goToday = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setWeek(getWeekNumber(n));
    setFocusedDate(toDateString(n));
  };

  const goPrevDay = () => {
    const next = addDaysToDateString(focusedDate, -1);
    setFocusedDate(next);
    const d = parseDateString(next);
    setYear(d.getFullYear());
    setWeek(getWeekNumber(d));
  };

  const goNextDay = () => {
    const next = addDaysToDateString(focusedDate, 1);
    setFocusedDate(next);
    const d = parseDateString(next);
    setYear(d.getFullYear());
    setWeek(getWeekNumber(d));
  };

  const toggleFocus = () => {
    if (viewMode === "week") {
      setFocusedDate(toDateString(new Date()));
      setViewMode("day");
    } else {
      setViewMode("week");
    }
  };

  const focusedDateLabel =
    viewMode === "day"
      ? parseDateString(focusedDate).toLocaleDateString("ru-RU", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <>
      <Header
        user={user}
        onLogout={onLogout}
        viewMode={viewMode}
        year={year}
        week={week}
        focusedDateLabel={focusedDateLabel}
        onPrevWeek={goPrevWeek}
        onNextWeek={goNextWeek}
        onPrevDay={goPrevDay}
        onNextDay={goNextDay}
        onToday={goToday}
        onToggleFocus={toggleFocus}
        theme={theme}
        onThemeChange={applyTheme}
        calendars={calendars}
        activeCalendarId={activeCalendarId}
        onCalendarChange={setActiveCalendarId}
        onOpenContexts={() => setContextsModalOpen(true)}
      />
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "0 16px 24px" }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)", padding: 24 }}>Загрузка…</p>
        ) : (
          <>
            <ContextFilters
              contexts={contexts}
              selectedContextId={selectedContextId}
              onSelect={setSelectedContextId}
            />
            <WeekGrid
              weekDays={displayDays}
              tasksByDate={tasksByDateForView}
              onTaskClick={setEditingTask}
              onTaskToggle={handleTaskToggle}
              onTaskMove={handleTaskMove}
              onAddDay={setCreatingForDate}
            />
            <SomedaySection
              tasks={filteredSomedayTasks}
              onTaskClick={setEditingTask}
              onTaskToggle={handleTaskToggle}
              onTaskMove={handleTaskMove}
              onAddTask={() => setCreatingForDate(null)}
            />
          </>
        )}
      </main>
      {(editingTask || creatingForDate !== null) && (
        <TaskModal
          task={editingTask}
          contexts={contexts}
          defaultDate={creatingForDate ?? undefined}
          onSave={handleTaskSave}
          onDelete={editingTask ? () => handleTaskDelete(editingTask.id) : undefined}
          onClose={() => {
            setEditingTask(null);
            setCreatingForDate(null);
          }}
        />
      )}
      {contextsModalOpen && (
        <ContextsModal
          contexts={contexts}
          onClose={() => setContextsModalOpen(false)}
          onSaved={() => {
            loadContexts();
          }}
        />
      )}
    </>
  );
}
