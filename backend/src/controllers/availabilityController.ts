import type { Request, Response, NextFunction } from "express";
import { consultationAvailability } from "../../../frontend/src/lib/content/consultationAvailability";
import { db } from "../config/db";
import { DEFAULT_DAY_CAPACITY } from "../services/bookingService";
import { formatDateKey, parseDateKey } from "../utils/date";

export async function availabilityHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");
    if (!from || !to) return res.status(400).json({ error: "from and to are required" });

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
    const staticFullyBooked = new Set(consultationAvailability.fullyBookedDates);
    const days = [];
    const cursor = parseDateKey(from);

    while (cursor <= toDate) {
      const dateKey = formatDateKey(cursor);
      const capacity = capacityByDate.get(dateKey);
      const bookingCount = bookingCountByDate.get(dateKey) ?? 0;
      const maxCapacity = capacity?.capacity ?? DEFAULT_DAY_CAPACITY;
      const blocked = Boolean(capacity?.blocked);
      days.push({
        date: dateKey,
        capacity: maxCapacity,
        booked: bookingCount,
        fullyBooked: blocked || staticFullyBooked.has(dateKey) || bookingCount >= maxCapacity,
        blocked,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return res.json({ days });
  } catch (error) {
    return next(error);
  }
}
