export type RecurringRule = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Calendar {
  id: number;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  calendarId: number;
  title: string;
  notes: string | null;
  date: string | null;
  completed: boolean;
  color: string | null;
  orderInDay: number;
  recurringRule: RecurringRule;
  createdAt: string;
  updatedAt: string;
}

export interface WeekData {
  monday: string;
  sunday: string;
  tasks: Task[];
}
