import { useState } from "react";
import type { Task } from "../types";
import { useDragDrop } from "../contexts/DragDropContext";
import { TaskCard } from "./TaskCard";

interface SomedaySectionProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskToggle: (task: Task) => void;
  onTaskMove: (taskId: number, newDate: null, newOrder: number) => void;
  onAddTask: () => void;
}

export function SomedaySection({
  tasks,
  onTaskClick,
  onTaskToggle,
  onTaskMove,
  onAddTask,
}: SomedaySectionProps) {
  const { pendingDropRef } = useDragDrop();
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    pendingDropRef.current = (id) => {
      const num = parseInt(String(id), 10);
      if (!Number.isNaN(num)) onTaskMove(num, null, tasks.length);
    };
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData("application/x-weekplanner-task");
    if (id) {
      const num = parseInt(id, 10);
      if (!Number.isNaN(num)) onTaskMove(num, null, tasks.length);
    }
    pendingDropRef.current = null;
  };

  return (
    <section
      data-droppable="someday"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        background: "var(--surface)",
        borderRadius: "var(--radius)",
        border: `1px solid ${dragOver ? "var(--accent)" : "var(--border)"}`,
        boxShadow: "var(--shadow)",
        padding: 16,
        transition: "border-color 0.15s",
      }}
    >
      <h2
        style={{
          margin: "0 0 12px",
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Когда-нибудь
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            onToggle={() => onTaskToggle(task)}
            onDropHere={(draggedId) => {
              if (draggedId !== task.id) onTaskMove(draggedId, null, index);
            }}
            dropTargetDate={null}
            showContextChip={false}
          />
        ))}
        <button
          type="button"
          onClick={onAddTask}
          style={{
            padding: "10px 12px",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius)",
            background: "transparent",
            color: "var(--text-muted)",
            fontSize: 13,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          + Добавить в «Когда-нибудь»
        </button>
      </div>
    </section>
  );
}
