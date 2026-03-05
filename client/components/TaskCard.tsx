import { useCallback, useState } from "react";
import type { Task } from "../types";
import { useDragDrop } from "../contexts/DragDropContext";
import { ContextChip } from "./ContextChip";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onToggle: () => void;
  onDropHere?: (draggedTaskId: number) => void;
  dropTargetDate?: string | null;
  showContextChip?: boolean;
}

const DRAG_TYPE = "application/x-weekplanner-task";

export function TaskCard({
  task,
  onClick,
  onToggle,
  onDropHere,
  dropTargetDate,
  showContextChip = true,
}: TaskCardProps) {
  const { draggedIdRef, pendingDropRef } = useDragDrop();
  const [dragOver, setDragOver] = useState(false);
  const context = task.Context ?? null;
  const borderColor = context?.color ?? "var(--border)";

  const finishDrag = useCallback(() => {
    const id = draggedIdRef.current;
    const drop = pendingDropRef.current;
    draggedIdRef.current = null;
    pendingDropRef.current = null;
    if (id != null && drop) drop(id);
  }, [draggedIdRef, pendingDropRef]);

  const handleDragStart = (e: React.DragEvent) => {
    draggedIdRef.current = task.id;
    e.dataTransfer.setData(DRAG_TYPE, String(task.id));
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task.title);
    // На Android Chrome drop и dragend при отпускании пальца не срабатывают — выполняем перенос по touchend
    document.addEventListener("touchend", finishDrag, { once: true, capture: true });
  };

  const handleDragEnd = () => {
    document.removeEventListener("touchend", finishDrag, true);
    finishDrag();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!onDropHere) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    pendingDropRef.current = (id) => onDropHere?.(id);
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const id = e.dataTransfer.getData(DRAG_TYPE);
    if (id && onDropHere) {
      const num = parseInt(id, 10);
      if (!Number.isNaN(num)) onDropHere(num);
    }
    pendingDropRef.current = null;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-task-id={task.id}
      data-drop-target={dropTargetDate ?? undefined}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button[data-action="toggle"]')) return;
        onClick();
      }}
      style={{
        padding: "8px 12px",
        borderRadius: "var(--radius)",
        background: dragOver ? "var(--accent-soft)" : "var(--surface)",
        border: `1px solid ${borderColor}`,
        borderLeftWidth: context ? 4 : 1,
        cursor: "grab",
        opacity: task.completed ? 0.75 : 1,
        transition: "background 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
        <button
          type="button"
          data-action="toggle"
          aria-label={task.completed ? "Восстановить" : "Выполнено"}
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          style={{
            flexShrink: 0,
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: "2px solid var(--border)",
            background: task.completed ? "var(--accent)" : "transparent",
            marginTop: 1,
            cursor: "pointer",
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontSize: 12,
              textDecoration: task.completed ? "line-through" : "none",
              color: task.completed ? "var(--completed)" : "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {task.title}
          </span>
          {showContextChip && context && (
            <div style={{ marginTop: 4 }}>
              <ContextChip context={context} small />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
