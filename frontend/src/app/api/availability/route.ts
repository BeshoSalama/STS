import { NextResponse } from "next/server";
import { consultationAvailability } from "@/lib/content/consultationAvailability";
import { formatDateKey, getAvailability, parseDateKey } from "@/lib/booking";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const { capacityByDate, bookingCountByDate } = await getAvailability(from, to);
  const staticFullyBooked = new Set(consultationAvailability.fullyBookedDates);
  const days = [];
  const cursor = parseDateKey(from);
  const end = parseDateKey(to);

  while (cursor <= end) {
    const dateKey = formatDateKey(cursor);
    const capacity = capacityByDate.get(dateKey);
    const bookingCount = bookingCountByDate.get(dateKey) ?? 0;
    const maxCapacity = 1;
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

  return NextResponse.json({ days });
}
