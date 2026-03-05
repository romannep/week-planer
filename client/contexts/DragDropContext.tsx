import { createContext, useContext, useRef, type ReactNode } from "react";

export interface DragDropContextValue {
  /** Id задачи, которую перетаскивают. Выставляется в dragStart, сбрасывается в dragEnd. */
  draggedIdRef: React.MutableRefObject<number | null>;
  /** Колбэк последней зоны сброса (подсвеченной при dragOver). На touch-устройствах drop не срабатывает — выполняем перенос в dragEnd. */
  pendingDropRef: React.MutableRefObject<((id: number) => void) | null>;
}

const DragDropContext = createContext<DragDropContextValue | null>(null);

export function DragDropProvider({ children }: { children: ReactNode }) {
  const draggedIdRef = useRef<number | null>(null);
  const pendingDropRef = useRef<((id: number) => void) | null>(null);
  return (
    <DragDropContext.Provider value={{ draggedIdRef, pendingDropRef }}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop(): DragDropContextValue {
  const ctx = useContext(DragDropContext);
  if (!ctx) throw new Error("useDragDrop must be used within DragDropProvider");
  return ctx;
}

export { DragDropContext };
