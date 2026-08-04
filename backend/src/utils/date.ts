export function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}
