import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { CalendarDays, ClipboardList, CreditCard, Mail, Phone, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import { ChangePasswordForm, type ChangePasswordState } from "@/components/auth/ChangePasswordForm";
import { DeleteAccountButton } from "@/components/auth/DeleteAccountButton";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStaff } from "@/lib/roles";
import { requireSession } from "@/lib/rbac";
import { changePasswordSchema } from "@/lib/validations/auth";

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

async function changePassword(_: ChangePasswordState, formData: FormData): Promise<ChangePasswordState> {
  "use server";
  const session = await requireSession();
  if (!session) redirect("/login");

  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the password requirements below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    return {
      status: "error",
      message: "Password login is not enabled for this account.",
    };
  }

  const passwordMatches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);

  if (!passwordMatches) {
    return {
      status: "error",
      message: "Old password is incorrect.",
      fieldErrors: {
        currentPassword: ["Old password is incorrect"],
      },
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash },
  });

  revalidatePath("/profile");

  return {
    status: "success",
    message: "Password changed successfully.",
  };
}

async function deleteAccount(formData: FormData) {
  "use server";
  const session = await requireSession();
  if (!session) redirect("/login");

  const confirmation = String(formData.get("confirmation") ?? "").trim();
  if (confirmation !== "CONFIRM_ACCOUNT_DELETE") {
    redirect("/profile");
  }

  const userId = session.user.id;

  await db.$transaction(async (tx) => {
    const leads = await tx.lead.findMany({
      where: { userId },
      select: { id: true },
    });
    const leadIds = leads.map((lead) => lead.id);

    await tx.brief.deleteMany({
      where: {
        OR: [{ userId }, ...(leadIds.length > 0 ? [{ leadId: { in: leadIds } }] : [])],
      },
    });

    if (leadIds.length > 0) {
      await tx.packageQuote.deleteMany({ where: { leadId: { in: leadIds } } });
    }

    await tx.lead.deleteMany({ where: { userId } });
    await tx.booking.deleteMany({ where: { userId } });
    await tx.campaign.deleteMany({ where: { userId } });
    await tx.userSubscription.deleteMany({ where: { userId } });
    await tx.paymentTransaction.updateMany({ where: { reviewedBy: userId }, data: { reviewedBy: null } });
    await tx.paymentTransaction.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });

  await signOut({ redirectTo: "/" });
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

function roleBadgeClass(role: string) {
  if (role === "DEVELOPER") return "border-fuchsia-300/45 bg-fuchsia-400/18 text-fuchsia-50 shadow-[0_0_22px_rgba(217,70,239,0.18)]";
  if (role === "ADMIN") return "border-violet-300/45 bg-violet-400/18 text-violet-50 shadow-[0_0_22px_rgba(139,92,246,0.18)]";
  if (role === "STAFF") return "border-sky-300/45 bg-sky-400/18 text-sky-50 shadow-[0_0_22px_rgba(56,189,248,0.16)]";
  return "border-emerald-300/45 bg-emerald-400/18 text-emerald-50 shadow-[0_0_22px_rgba(52,211,153,0.14)]";
}

export default async function ProfilePage() {
  const session = await requireSession();
  if (!session) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });

  if (!user) redirect("/login");

  const backOfficeAccount = isStaff(user.role);
  const userScope = backOfficeAccount ? undefined : { userId: session.user.id };
  const leadScope = backOfficeAccount ? undefined : { userId: session.user.id };
  const quoteScope = backOfficeAccount ? undefined : { lead: { userId: session.user.id } };

  const [leadCount, briefCount, bookingCount, quoteCount, paymentCount, payments, subscription] = await Promise.all([
    db.lead.count({ where: leadScope }),
    db.brief.count({ where: userScope }),
    db.booking.count({ where: userScope }),
    db.packageQuote.count({ where: quoteScope }),
    db.paymentTransaction.count({ where: userScope }),
    db.paymentTransaction.findMany({
      where: userScope,
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        planNameSnapshot: true,
        amount: true,
        currency: true,
        paymentMethod: true,
        status: true,
        adminNotes: true,
        createdAt: true,
        reviewedAt: true,
      },
    }),
    db.userSubscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  const adminHref = isStaff(user.role) ? "/admin" : null;
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
            {adminHref && (
              <Link href={adminHref} className="rounded-full border border-violet-300/45 bg-violet-gradient px-5 py-2 text-sm font-black text-white shadow-[0_0_26px_rgba(139,92,246,0.28)] transition hover:border-violet-200/70 hover:brightness-110">
                Dashboard
              </Link>
            )}
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
                <span className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-black ${roleBadgeClass(user.role)}`}>
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
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="font-display text-3xl font-bold">{paymentCount}</p>
                <p className="text-xs text-white/45">Payments</p>
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
                <DetailItem icon={<CreditCard size={18} />} label="Current Plan" value={subscription?.planNameSnapshot ?? "Not active"} />
                <DetailItem icon={<ShieldCheck size={18} />} label="Plan Status" value={subscription?.status ?? "No subscription"} />
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-display text-2xl font-bold">Payments</h2>
              <div className="mt-5 grid gap-3">
                {payments.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-white/58">No payment submissions yet.</p>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-xl font-bold">{payment.planNameSnapshot}</p>
                          <p className="mt-1 text-sm text-white/58">
                            {Number(payment.amount.toString()).toLocaleString()} {payment.currency} via {payment.paymentMethod === "VODAFONE_CASH" ? "Vodafone Cash" : "InstaPay"}
                          </p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${paymentStatusClass(payment.status)}`}>
                          {customerPaymentStatus(payment.status)}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-white/42">Submitted {payment.createdAt.toLocaleString()}</p>
                      {payment.status === "APPROVED" && (
                        <p className="mt-3 text-sm font-bold text-emerald-200">تم تأكيد الدفع وتفعيل خطتك بنجاح.</p>
                      )}
                      {payment.status === "REJECTED" && payment.adminNotes && (
                        <p className="mt-3 rounded-lg border border-red-300/20 bg-red-500/10 p-3 text-sm font-bold text-red-100">
                          Reason: {payment.adminNotes}
                        </p>
                      )}
                    </div>
                  ))
                )}
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

            <ChangePasswordForm action={changePassword} />

            <section className="rounded-lg border border-red-300/20 bg-red-500/[0.06] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-xl">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-red-100">
                    <ShieldAlert size={20} />
                  </div>
                  <h2 className="font-display text-2xl font-bold">Delete Account</h2>
                  <p className="mt-2 text-sm leading-6 text-white/58">
                    This permanently removes your account, login sessions, campaign data, bookings, leads, briefs, and quotes.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <DeleteAccountButton action={deleteAccount} />
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function customerPaymentStatus(status: string) {
  if (status === "APPROVED") return "تم تأكيد الدفع";
  if (status === "REJECTED") return "تم رفض التحويل";
  return "قيد المراجعة";
}

function paymentStatusClass(status: string) {
  if (status === "APPROVED") return "border-emerald-300/25 bg-emerald-400/10 text-emerald-100";
  if (status === "REJECTED") return "border-red-300/25 bg-red-500/10 text-red-100";
  return "border-amber-300/25 bg-amber-400/10 text-amber-100";
}
