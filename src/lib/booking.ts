import { db } from "@/lib/db";

export const DEFAULT_DAY_CAPACITY = 6;

export function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

export function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getAvailability(from: string, to: string) {
  const fromDate = parseDateKey(from);
  const toDate = parseDateKey(to);
  const capacities = await db.dayCapacity.findMany({ where: { date: { gte: fromDate, lte: toDate } } });
  const bookings = await db.booking.groupBy({
    by: ["date"],
    where: { date: { gte: fromDate, lte: toDate } },
    _count: { _all: true },
  });

  const capacityByDate = new Map(capacities.map((day) => [formatDateKey(day.date), day]));
  const bookingCountByDate = new Map(bookings.map((day) => [formatDateKey(day.date), day._count._all]));

  return { capacityByDate, bookingCountByDate };
}

export async function assertBookable(dateKey: string) {
  const date = parseDateKey(dateKey);
  const capacity = await db.dayCapacity.findUnique({ where: { date } });
  if (capacity?.blocked) return { ok: false as const, reason: "DAY_BLOCKED" };

  const bookingCount = await db.booking.count({ where: { date } });
  const dayCapacity = capacity?.capacity ?? DEFAULT_DAY_CAPACITY;
  if (bookingCount >= dayCapacity) return { ok: false as const, reason: "DAY_FULL" };

  return { ok: true as const, date };
}
