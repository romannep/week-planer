export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function getMondayOfWeek(year: number, week: number): Date {
  const jan1 = new Date(year, 0, 1);
  const day = jan1.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const firstMonday = new Date(jan1);
  firstMonday.setDate(jan1.getDate() + diff);
  const monday = new Date(firstMonday);
  monday.setDate(firstMonday.getDate() + (week - 1) * 7);
  return monday;
}

export function formatDayShort(date: Date): string {
  return date.toLocaleDateString("ru-RU", { weekday: "short" });
}

export function formatDayNum(date: Date): string {
  return date.getDate().toString();
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeekDays(year: number, week: number): Date[] {
  const monday = getMondayOfWeek(year, week);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y!, m! - 1, d!);
}

export function addDaysToDateString(dateStr: string, delta: number): string {
  const d = parseDateString(dateStr);
  d.setDate(d.getDate() + delta);
  return toDateString(d);
}
