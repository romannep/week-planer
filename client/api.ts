import { API_ORIGIN } from "./config";
import type { Calendar, Context, Task, User, WeekData } from "./types";

const base = `${API_ORIGIN}/api`;
const fetchOpts: RequestInit = { credentials: "include" };

let onAuthFailure: (() => void) | null = null;
export function setAuthFailure(cb: (() => void) | null): void {
  onAuthFailure = cb;
}

export type AuthErrorCode = "NO_TOKEN" | "INVALID_TOKEN";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode
  ) {
    super(message);
    this.name = "AuthError";
  }
}

async function handleResponse<T>(r: Response, parseJson = true): Promise<T> {
  if (r.status === 401) {
    let code: AuthErrorCode = "NO_TOKEN";
    try {
      const body = (await r.json()) as { code?: AuthErrorCode };
      if (body.code === "NO_TOKEN" || body.code === "INVALID_TOKEN") code = body.code;
    } catch {
      // body не JSON или пустой
    }
    onAuthFailure?.();
    throw new AuthError("unauthorized", code);
  }
  if (!r.ok) {
    const text = await r.text();
    try {
      const j = JSON.parse(text) as { error?: string };
      if (typeof j.error === "string") throw new Error(j.error);
    } catch (e) {
      if (e instanceof Error && e.message !== text) throw e;
    }
    throw new Error(text);
  }
  if (r.status === 204) return undefined as T;
  return parseJson ? (r.json() as Promise<T>) : (undefined as T);
}

async function get<T>(path: string): Promise<T> {
  const r = await fetch(base + path, fetchOpts);
  return handleResponse<T>(r);
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(base + path, {
    ...fetchOpts,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(r);
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(base + path, {
    ...fetchOpts,
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(r);
}

async function del(path: string): Promise<void> {
  const r = await fetch(base + path, { ...fetchOpts, method: "DELETE" });
  await handleResponse<undefined>(r, false);
}

export const api = {
  auth: {
    getMe: () => get<{ user: User }>("/auth/me").then((d) => d.user),
    login: (login: string, password: string) =>
      post<{ user: User }>("/auth/login", { login, password }).then((d) => d.user),
    register: (login: string, password: string) =>
      post<{ user: User }>("/auth/register", { login, password }).then((d) => d.user),
    logout: () => post<{ ok: boolean }>("/auth/logout", {}),
  },
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
