import type { Task } from "../types";
import { formatDayShort, formatDayNum, toDateString } from "../utils/date";
import { DayColumn } from "./DayColumn";

interface WeekGridProps {
  weekDays: Date[];
  tasksByDate: Map<string, Task[]>;
  onTaskClick: (task: Task) => void;
  onTaskToggle: (task: Task) => void;
  onTaskMove: (taskId: number, newDate: string | null, newOrder: number) => void;
  onAddDay: (date: string) => void;
}

export function WeekGrid({
  weekDays,
  tasksByDate,
  onTaskClick,
  onTaskToggle,
  onTaskMove,
  onAddDay,
}: WeekGridProps) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns:
          weekDays.length === 1 ? "1fr" : "repeat(7, minmax(0, 1fr))",
        gap: 12,
        marginBottom: 24,
        minHeight: 320,
      }}
    >
      {weekDays.map((day) => {
        const dateStr = toDateString(day);
        const tasks = tasksByDate.get(dateStr) ?? [];
        return (
          <DayColumn
            key={dateStr}
            date={day}
            dateLabel={formatDayShort(day)}
            dayNum={formatDayNum(day)}
            tasks={tasks}
            onTaskClick={onTaskClick}
            onTaskToggle={onTaskToggle}
            onTaskMove={(taskId, newOrder) => onTaskMove(taskId, dateStr, newOrder)}
            onAddTask={() => onAddDay(dateStr)}
          />
        );
      })}
    </section>
  );
}
