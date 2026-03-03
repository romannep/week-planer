import type { Calendar, Context, Task, WeekData } from "./types";

const base = "/api";

async function get<T>(path: string): Promise<T> {
  const r = await fetch(base + path);
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  if (r.status === 204) return undefined as T;
  return r.json() as Promise<T>;
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(base + path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

async function del(path: string): Promise<void> {
  const r = await fetch(base + path, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
}

export const api = {
  contexts: {
    list: () => get<Context[]>("/contexts"),
    create: (data: { name: string; color: string }) => post<Context>("/contexts", data),
    get: (id: number) => get<Context>(`/contexts/${id}`),
    update: (id: number, data: Partial<{ name: string; color: string }>) =>
      patch<Context>(`/contexts/${id}`, data),
    delete: (id: number) => del(`/contexts/${id}`),
  },
  calendars: {
    list: () => get<Calendar[]>("/calendars"),
    create: (data: { name: string; color?: string }) => post<Calendar>("/calendars", data),
    get: (id: number) => get<Calendar>(`/calendars/${id}`),
    update: (id: number, data: Partial<{ name: string; color: string }>) =>
      patch<Calendar>(`/calendars/${id}`, data),
    delete: (id: number) => del(`/calendars/${id}`),
  },
  tasks: {
    list: (params?: { calendarId?: number; from?: string; to?: string; someday?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.calendarId != null) q.set("calendarId", String(params.calendarId));
      if (params?.from) q.set("from", params.from);
      if (params?.to) q.set("to", params.to);
      if (params?.someday) q.set("someday", "true");
      const query = q.toString();
      return get<Task[]>(`/tasks${query ? `?${query}` : ""}`);
    },
    create: (data: {
      calendarId?: number;
      contextId?: number | null;
      title: string;
      notes?: string;
      date?: string | null;
      recurringRule?: Task["recurringRule"];
    }) => post<Task>("/tasks", data),
    get: (id: number) => get<Task>(`/tasks/${id}`),
    update: (
      id: number,
      data: Partial<{
        title: string;
        notes: string | null;
        date: string | null;
        completed: boolean;
        contextId: number | null;
        orderInDay: number;
        recurringRule: Task["recurringRule"];
      }>
    ) => patch<Task>(`/tasks/${id}`, data),
    delete: (id: number) => del(`/tasks/${id}`),
  },
  week: {
    get: (year: number, week: number, calendarId?: number) => {
      const q = calendarId != null ? `?calendarId=${calendarId}` : "";
      return get<WeekData>(`/week/${year}/${week}${q}`);
    },
    someday: (calendarId?: number) => {
      const q = calendarId != null ? `?calendarId=${calendarId}` : "";
      return get<Task[]>(`/week/someday${q}`);
    },
    roll: (fromDate: string, toDate: string, calendarId?: number) =>
      post<{ updated: number }>("/week/roll", { fromDate, toDate, calendarId }),
  },
};
