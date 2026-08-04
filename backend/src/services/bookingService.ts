import { consultationAvailability } from "../../../frontend/src/lib/content/consultationAvailability";
import { db } from "../config/db";
import { parseDateKey } from "../utils/date";

const DEFAULT_DAY_CAPACITY = 6;

export async function assertBookable(dateKey: string) {
  const date = parseDateKey(dateKey);
  const capacity = await db.dayCapacity.findUnique({ where: { date } });

  if (capacity?.blocked || consultationAvailability.fullyBookedDates.includes(dateKey)) {
    return { ok: false as const, reason: "DAY_BLOCKED" };
  }

  const bookingCount = await db.booking.count({ where: { date } });
  const dayCapacity = capacity?.capacity ?? DEFAULT_DAY_CAPACITY;
  if (bookingCount >= dayCapacity) {
    return { ok: false as const, reason: "DAY_FULL" };
  }

  return { ok: true as const, date };
}

export { DEFAULT_DAY_CAPACITY };
