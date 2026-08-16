"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Facebook, MapPin, MessageCircle, Navigation, Send } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { siteConfig } from "@/lib/content/nav";
import { consultationAvailability } from "@/lib/content/consultationAvailability";

type ConsultationRequest = {
  name: string;
  phone: string;
  consultationDate: string;
};

type ConsultationDay = {
  date: Date;
  dateKey: string;
  dayLabel: string;
  dateLabel: string;
  isPast: boolean;
  isBooked: boolean;
  isSelectable: boolean;
};

async function submitContactForm(data: ConsultationRequest) {
  const response = await apiFetch("/leads/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(result?.error ?? "Could not book this consultation");
  }

  return response.json();
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const weekFormatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getSundayOfWeek(date: Date) {
  const start = startOfDay(date);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function buildWeekDays(weekOffset: number, fullyBookedDates: Set<string>): ConsultationDay[] {
  const today = startOfDay(new Date());
  const weekStart = addDays(getSundayOfWeek(today), weekOffset * 7);

  return consultationAvailability.workingDays.map((dayNumber) => {
    const date = addDays(weekStart, dayNumber);
    const dateKey = formatDateKey(date);
    const isPast = date < today;
    const isBooked = fullyBookedDates.has(dateKey);

    return {
      date,
      dateKey,
      dayLabel: dayLabels[dayNumber],
      dateLabel: monthFormatter.format(date),
      isPast,
      isBooked,
      isSelectable: !isPast && !isBooked,
    };
  });
}

function formatSelectedDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return weekFormatter.format(new Date(year, month - 1, day));
}

function MapVisual() {
  return (
    <div className="contact-location-side">
      <div className="contact-map-card">
        <iframe
          title="STS Agency location — First District, 6th of October City"
          src="https://www.google.com/maps?q=29.983000%2C30.966843&z=18&output=embed"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="contact-map-frame"
        />
        <div className="contact-map-shade" />
        <a
          href={siteConfig.mapUrl}
          target="_blank"
          rel="noreferrer"
          data-no-ripple
          className="contact-map-marker"
          aria-label="Open directions to STS Agency"
        >
          <MapPin size={22} />
          <span>Open location</span>
        </a>
      </div>

      <a
        href={siteConfig.mapUrl}
        target="_blank"
        rel="noreferrer"
        className="contact-location-caption"
        aria-label="Get directions to Building 10, Neighborhood 2, First District"
      >
        <span className="contact-location-caption__icon">
          <Navigation size={21} />
        </span>
        <span>
          <small>Our location</small>
          <strong>Building 10, Neighborhood 2, First District</strong>
          <b>6th of October City, Giza 12568, Egypt</b>
        </span>
      </a>
    </div>
  );
}

export function ContactPanel() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [fullyBookedDates, setFullyBookedDates] = useState(() => new Set(consultationAvailability.fullyBookedDates));
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const weekDays = useMemo(() => buildWeekDays(weekOffset, fullyBookedDates), [fullyBookedDates, weekOffset]);
  const maxWeekOffset = consultationAvailability.weeksToShow - 1;
  const weekStart = weekDays[0]?.date;
  const weekEnd = weekDays[weekDays.length - 1]?.date;

  useEffect(() => {
    if (!weekStart || !weekEnd) return;

    const controller = new AbortController();
    apiFetch(`/availability?from=${formatDateKey(weekStart)}&to=${formatDateKey(weekEnd)}`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Could not load availability"))))
      .then((data: { days?: { date: string; fullyBooked: boolean }[] }) => {
        const dates = new Set(consultationAvailability.fullyBookedDates);
        for (const day of data.days ?? []) {
          if (day.fullyBooked) dates.add(day.date);
        }
        setFullyBookedDates(dates);
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") {
          setMessage("Availability is temporarily using the default calendar.");
        }
      });

    return () => controller.abort();
  }, [weekEnd, weekStart]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !selectedDate) return;
    setStatus("loading");
    setMessage("");
    try {
      await submitContactForm({ name, phone, consultationDate: selectedDate });
      setStatus("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not book this consultation");
      setStatus("error");
    }
  }

  return (
    <section className="contact-reference-section pb-28">
      <div className="contact-reference-grid container">
        <div className="contact-reference-form">
          <h1>Free Consultation</h1>
          <p className="contact-reference-intro">
            Let&apos;s build a brand that grows, expands, and stands out from the rest. Send us a message and our
            team will contact you during our working{" "}
            <strong>hours, from 10 AM to 6 PM.</strong>
          </p>

          {status === "done" ? (
            <div className="contact-reference-success">
              <CheckCircle2 size={23} />
              <p>Thanks! We&apos;ll confirm your consultation for {formatSelectedDate(selectedDate)} shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-reference-fields">
              {status === "error" && message && (
                <div className="contact-reference-success border-red-200 bg-red-50 text-red-700">
                  <p>{message}</p>
                </div>
              )}
              <div className="consultation-scheduler" aria-label="Choose consultation day">
                <div className="consultation-scheduler__header">
                  <span>
                    <CalendarDays size={18} />
                    Choose your day
                  </span>
                  <div className="consultation-scheduler__nav">
                    <button
                      type="button"
                      aria-label="Previous week"
                      disabled={weekOffset === 0}
                      onClick={() => {
                        setWeekOffset((currentWeek) => Math.max(0, currentWeek - 1));
                        setSelectedDate("");
                      }}
                    >
                      <ChevronLeft size={17} />
                    </button>
                    <b>
                      {weekStart && weekEnd ? `${weekFormatter.format(weekStart)} - ${weekFormatter.format(weekEnd)}` : ""}
                    </b>
                    <button
                      type="button"
                      aria-label="Next week"
                      disabled={weekOffset === maxWeekOffset}
                      onClick={() => {
                        setWeekOffset((currentWeek) => Math.min(maxWeekOffset, currentWeek + 1));
                        setSelectedDate("");
                      }}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>

                <div className="consultation-days">
                  {weekDays.map((day) => (
                    <button
                      key={day.dateKey}
                      type="button"
                      disabled={!day.isSelectable}
                      className={selectedDate === day.dateKey ? "is-selected" : undefined}
                      onClick={() => setSelectedDate(day.dateKey)}
                    >
                      <span>{day.dayLabel}</span>
                      <strong>{day.dateLabel}</strong>
                      <small>{day.isBooked ? "Busy" : day.isPast ? "Passed" : "Available"}</small>
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="tel"
                required
                placeholder="Your Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button type="submit" data-ripple className="contact-reference-submit" disabled={!selectedDate || status === "loading"}>
                {status === "loading" ? "Sending..." : selectedDate ? "Submit" : "Choose a day to submit"}
              </button>
            </form>
          )}

          <div className="contact-reference-footer">
            <div className="contact-reference-socials">
              <a href="#" aria-label="Facebook" data-ripple>
                <Facebook size={25} />
              </a>
              <a href="#" aria-label="WhatsApp" data-ripple>
                <MessageCircle size={24} />
              </a>
              <a href="#" aria-label="Telegram" data-ripple>
                <Send size={23} />
              </a>
            </div>
            <p>{siteConfig.phone}</p>
          </div>
        </div>

        <MapVisual />
      </div>
    </section>
  );
}
