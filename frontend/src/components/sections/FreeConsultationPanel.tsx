"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Video,
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";
import { cn } from "@/lib/cn";
import { consultationAvailability } from "@/lib/content/consultationAvailability";

type BookingForm = {
  name: string;
  email: string;
  phone: string;
  company: string;
  activity: string;
  source: string;
  goal: string;
  website: string;
};

type ConsultationDay = {
  date: Date;
  dateKey: string;
  dayName: string;
  dayNumber: string;
  monthName: string;
  isPast: boolean;
  isBooked: boolean;
  isSelectable: boolean;
};

const initialForm: BookingForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  activity: "",
  source: "",
  goal: "",
  website: "",
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const outcomes = [
  { icon: TrendingUp, title: "Current Situation Analysis", text: "A practical review of your current marketing position." },
  { icon: Target, title: "Growth Opportunities", text: "We identify the best opportunities for your business." },
  { icon: Sparkles, title: "Initial Strategy", text: "Clear first recommendations and a practical direction." },
  { icon: ClipboardCheck, title: "Actionable Steps", text: "Specific next steps you can start using right away." },
  { icon: MessageCircle, title: "Answers To Your Questions", text: "We answer your questions with direct, useful guidance." },
];

const timeline = [
  { icon: Check, title: "Instant Confirmation", text: "You will receive a confirmation after booking." },
  { icon: Sparkles, title: "Initial Review", text: "We review your business before the call." },
  { icon: Camera, title: "Consultation Session", text: "30 minutes of analysis and practical direction." },
  { icon: ShieldCheck, title: "Suggested Plan", text: "You get recommendations you can act on." },
];

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
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
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
      dayName: dayNames[dayNumber],
      dayNumber: String(date.getDate()).padStart(2, "0"),
      monthName: monthNames[date.getMonth()],
      isPast,
      isBooked,
      isSelectable: !isPast && !isBooked,
    };
  });
}

function formatRange(start?: Date, end?: Date) {
  if (!start || !end) return "";
  return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="fc-field">
      <span>
        {label}
        {required && <b>*</b>}
      </span>
      {children}
    </label>
  );
}

export function FreeConsultationPanel() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [fullyBookedDates, setFullyBookedDates] = useState(() => new Set(consultationAvailability.fullyBookedDates));
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const weekDays = useMemo(() => buildWeekDays(weekOffset, fullyBookedDates), [fullyBookedDates, weekOffset]);
  const weekStart = weekDays[0]?.date;
  const weekEnd = weekDays[weekDays.length - 1]?.date;
  const maxWeekOffset = consultationAvailability.weeksToShow - 1;

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
        if ((error as Error).name !== "AbortError") setMessage("Availability is temporarily using the default calendar.");
      });

    return () => controller.abort();
  }, [weekEnd, weekStart]);

  function updateField(field: keyof BookingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name || !form.phone || !selectedDate) return;

    setStatus("loading");
    setMessage("");
    try {
      const response = await apiFetch("/leads/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          activity: form.activity,
          source: form.source,
          goal: form.goal,
          consultationDate: selectedDate,
          website: form.website,
        }),
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(result?.error ?? "Could not book this consultation");
      }

      setStatus("done");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Could not book this consultation");
    }
  }

  return (
    <section className="free-consultation-page" dir="ltr">
      <div className="fc-grid-bg" aria-hidden="true" />
      <div className="container fc-shell">
        <section className="fc-hero">
          <div className="fc-hero-copy">
            <p className="fc-eyebrow">Free Consultation</p>
            <h1>
              Your <span>first step</span> toward real growth
            </h1>
            <p className="fc-subtitle">In 30 minutes, we analyze your current situation and uncover the best growth opportunities for your business.</p>
            <div className="fc-benefits">
              <span>
                <ShieldCheck size={18} />
                100% Free
                <small>No commitment required</small>
              </span>
              <span>
                <Sparkles size={18} />
                Tailored Session
                <small>Specific analysis for your case</small>
              </span>
              <span>
                <Target size={18} />
                Expert Guidance
                <small>STS team, step by step</small>
              </span>
            </div>
          </div>

          <div className="fc-hero-visual" aria-hidden="true">
            <div className="fc-orbit" />
            <div className="fc-chair">
              <CalendarCheck className="fc-chair-calendar" size={88} />
              <span className="fc-chair-seat" />
              <span className="fc-chair-base" />
            </div>
            <div className="fc-float fc-float--video"><Video size={24} /></div>
            <div className="fc-float fc-float--chat"><MessageCircle size={24} /></div>
            <div className="fc-float fc-float--chart"><BarChart3 size={24} /></div>
          </div>
        </section>

        <section className="fc-booking-card">
          <h2>Book your consultation in 3 simple steps</h2>
          <div className="fc-steps" aria-label="Booking steps">
            {["Your Information", "Business Details", "Confirm Booking"].map((step, index) => (
              <div key={step} className={cn("fc-step", index === 2 && "is-active")}>
                <span>0{index + 1}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="fc-booking-grid">
            <aside className="fc-after-card">
              <h3>What happens after booking?</h3>
              <div className="fc-timeline">
                {timeline.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title}>
                      <span><Icon size={16} /></span>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </aside>

            <form className="fc-form" onSubmit={handleSubmit}>
              <div className="fc-date-picker">
                <div className="fc-date-head">
                  <span>
                    <CalendarDays size={18} />
                    Choose an available date from Sunday to Thursday
                  </span>
                  <div>
                    <button type="button" disabled={weekOffset === 0} onClick={() => { setWeekOffset((v) => Math.max(0, v - 1)); setSelectedDate(""); }} aria-label="Previous week">
                      <ChevronLeft size={16} />
                    </button>
                    <b>{formatRange(weekStart, weekEnd)}</b>
                    <button type="button" disabled={weekOffset === maxWeekOffset} onClick={() => { setWeekOffset((v) => Math.min(maxWeekOffset, v + 1)); setSelectedDate(""); }} aria-label="Next week">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="fc-days">
                  {weekDays.map((day) => (
                    <button
                      key={day.dateKey}
                      type="button"
                      disabled={!day.isSelectable}
                      className={cn(selectedDate === day.dateKey && "is-selected")}
                      onClick={() => setSelectedDate(day.dateKey)}
                    >
                      <span>{day.dayName}</span>
                      <strong>{day.dayNumber}</strong>
                      <small>{day.isBooked ? "Booked" : day.isPast ? "Passed" : "Available"}</small>
                      <em>{day.monthName}</em>
                    </button>
                  ))}
                </div>
              </div>

              <div className="fc-form-grid">
                <Field label="Full Name" required>
                  <input value={form.name} onChange={(e) => updateField("name", e.target.value)} required placeholder="Enter your full name" />
                </Field>
                <Field label="Email Address">
                  <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} placeholder="example@email.com" />
                </Field>
                <Field label="Phone Number" required>
                  <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} required placeholder="5xxxxxxxxx" />
                </Field>
                <Field label="Company / Activity">
                  <input value={form.company} onChange={(e) => updateField("company", e.target.value)} placeholder="Your company or activity name" />
                </Field>
                <Field label="Website (Optional)">
                  <input value={form.website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://yourwebsite.com" />
                </Field>
                <Field label="What best describes your business?" required>
                  <select value={form.activity} onChange={(e) => updateField("activity", e.target.value)} required>
                    <option value="">Choose an industry</option>
                    <option>E-commerce</option>
                    <option>Medical / Clinic</option>
                    <option>Restaurant / Cafe</option>
                    <option>Real Estate</option>
                    <option>Professional Services</option>
                    <option>Other</option>
                  </select>
                </Field>
                <Field label="How did you hear about STS?">
                  <select value={form.source} onChange={(e) => updateField("source", e.target.value)}>
                    <option value="">Choose an answer</option>
                    <option>Facebook / Instagram</option>
                    <option>Google</option>
                    <option>Friend referral</option>
                    <option>Previous client</option>
                  </select>
                </Field>
                <Field label="Main goal for this consultation">
                  <select value={form.goal} onChange={(e) => updateField("goal", e.target.value)}>
                    <option value="">Choose a goal</option>
                    <option>Increase sales</option>
                    <option>Improve ad campaigns</option>
                    <option>Build brand and marketing system</option>
                    <option>Analyze current situation</option>
                  </select>
                </Field>
              </div>

              {message && <p className={cn("fc-message", status === "error" && "is-error")}>{message}</p>}
              {status === "done" && <p className="fc-message">Your consultation has been booked successfully. We will review your details and confirm the appointment.</p>}

              <button className="fc-submit" type="submit" disabled={status === "loading" || !selectedDate}>
                {status === "loading" ? "Booking..." : "Next"}
                <ArrowRight size={18} />
              </button>
              <p className="fc-privacy"><Lock size={14} /> We keep your data 100% private.</p>
            </form>
          </div>
        </section>

        <section className="fc-outcomes">
          <h2>What will you get from the consultation?</h2>
          <div>
            {outcomes.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title}>
                  <Icon size={26} />
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="fc-proof-grid">
          <article className="fc-proof-card">
            <h2>Why choose STS?</h2>
            <p>We do not sell vague promises. We build measurable marketing systems through clear strategy and disciplined execution.</p>
            <div className="fc-stats">
              <strong>+250<small>Happy clients</small></strong>
              <strong>+5M<small>Total managed budget</small></strong>
              <strong>+18%<small>Average client growth</small></strong>
              <strong>5<small>Years of experience</small></strong>
            </div>
          </article>
          <article className="fc-testimonial">
            <h2>What do clients say?</h2>
            <p>The free consultation with STS helped us understand exactly where our marketing was leaking budget and what to fix first.</p>
            <div>
              <span>Ahmed Mohamed</span>
              <small>Marketing Manager - E-commerce Brand</small>
            </div>
          </article>
        </section>
      </div>
    </section>
  );
}
