import type { Task } from "../types";
import { toDateString } from "../utils/date";
import { TaskCard } from "./TaskCard";

interface DayColumnProps {
  date: Date;
  dateLabel: string;
  dayNum: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskToggle: (task: Task) => void;
  onTaskMove: (taskId: number, newOrder: number) => void;
  onAddTask: () => void;
}

export function DayColumn({
  date,
  dateLabel,
  dayNum,
  tasks,
  onTaskClick,
  onTaskToggle,
  onTaskMove,
  onAddTask,
}: DayColumnProps) {
  const dateStr = toDateString(date);
  const isToday = toDateString(new Date()) === dateStr;

  const handleColumnDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("application/x-weekplanner-task");
    if (id) {
      const num = parseInt(id, 10);
      if (!Number.isNaN(num)) onTaskMove(num, tasks.length);
    }
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div
      data-day={dateStr}
      data-droppable="day"
      onDragOver={handleColumnDragOver}
      onDrop={handleColumnDrop}
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: `1px solid ${isToday ? "var(--accent)" : "var(--border)"}`,
        boxShadow: "var(--shadow)",
        display: "flex",
        flexDirection: "column",
        minHeight: 200,
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid var(--border)",
          background: isToday ? "var(--accent-soft)" : "transparent",
          borderRadius: "var(--radius) var(--radius) 0 0",
        }}
      >
        <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>
          {dateLabel}
        </div>
        <div style={{ fontSize: 20, fontWeight: 600 }}>{dayNum}</div>
      </div>
      <div
        style={{
          flex: 1,
          padding: 8,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          minHeight: 0,
        }}
      >
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onToggle={() => onTaskToggle(task)}
            onDropHere={(draggedId) => {
              if (draggedId !== task.id) onTaskMove(draggedId, index);
            }}
            dropTargetDate={dateStr}
          />
        ))}
        <button
          type="button"
          onClick={onAddTask}
          style={{
            marginTop: 4,
            padding: "8px 12px",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          + Добавить
        </button>
      </div>
    </div>
  );
}
