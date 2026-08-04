import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { CalendarDays, ClipboardList, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/rbac";

async function updateProfile(formData: FormData) {
  "use server";
  const session = await requireSession();
  if (!session) redirect("/login");

  await db.user.update({
    where: { id: session.user.id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
    },
  });

  revalidatePath("/profile");
  revalidatePath("/portal");
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-violet-100">
        {icon}
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white/82">{value}</p>
    </div>
  );
}

export default async function ProfilePage() {
  const session = await requireSession();
  if (!session) redirect("/login");

  const [user, leadCount, briefCount, bookingCount, quoteCount] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    db.lead.count({ where: { userId: session.user.id } }),
    db.brief.count({ where: { userId: session.user.id } }),
    db.booking.count({ where: { userId: session.user.id } }),
    db.packageQuote.count({ where: { lead: { userId: session.user.id } } }),
  ]);

  if (!user) redirect("/login");

  const dashboardHref = user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/portal";
  const initials = (user.name ?? user.email)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[#080216] pt-32 text-white sm:pt-40">
      <section className="container grid gap-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-200">Account Profile</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold sm:text-5xl">Your STS Profile</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={dashboardHref} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              {user.role === "CLIENT" ? "Portal" : "Admin"}
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-violet-gradient font-display text-2xl font-extrabold text-white shadow-card">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-2xl font-bold">{user.name ?? "STS User"}</h2>
                <p className="mt-1 truncate text-sm text-white/58">{user.email}</p>
                <span className="mt-3 inline-flex rounded-full border border-violet-300/25 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-100">
                  {user.role}
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="font-display text-3xl font-bold">{leadCount}</p>
                <p className="text-xs text-white/45">Leads</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="font-display text-3xl font-bold">{briefCount}</p>
                <p className="text-xs text-white/45">Briefs</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="font-display text-3xl font-bold">{bookingCount}</p>
                <p className="text-xs text-white/45">Bookings</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="font-display text-3xl font-bold">{quoteCount}</p>
                <p className="text-xs text-white/45">Quotes</p>
              </div>
            </div>
          </aside>

          <div className="grid gap-6">
            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-display text-2xl font-bold">Account Details</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <DetailItem icon={<UserRound size={18} />} label="Name" value={user.name ?? "Not set"} />
                <DetailItem icon={<Mail size={18} />} label="Email" value={user.email} />
                <DetailItem icon={<Phone size={18} />} label="Phone" value={user.phone || "Not set"} />
                <DetailItem icon={<ShieldCheck size={18} />} label="Role" value={user.role} />
                <DetailItem icon={<CalendarDays size={18} />} label="Joined" value={user.createdAt.toLocaleDateString()} />
                <DetailItem icon={<ClipboardList size={18} />} label="Updated" value={user.updatedAt.toLocaleDateString()} />
              </div>
            </section>

            <form action={updateProfile} className="grid gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-display text-2xl font-bold">Edit Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold">
                  Name
                  <input
                    name="name"
                    defaultValue={user.name ?? ""}
                    className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-violet-300/50"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Phone
                  <input
                    name="phone"
                    defaultValue={user.phone ?? ""}
                    className="min-h-11 rounded-lg border border-white/10 bg-black/20 px-3 text-white outline-none focus:border-violet-300/50"
                  />
                </label>
              </div>
              <button className="w-fit rounded-full bg-violet-gradient px-5 py-3 text-sm font-bold text-white shadow-card">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
