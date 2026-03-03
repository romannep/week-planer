export type RecurringRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Calendar {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Context {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  calendarId: number;
  contextId: number | null;
  title: string;
  notes: string | null;
  date: string | null;
  completed: boolean;
  orderInDay: number;
  recurringRule: RecurringRule;
  createdAt: string;
  updatedAt: string;
  Context?: Context | null;
}

export interface WeekData {
  monday: string;
  sunday: string;
  tasks: Task[];
}
