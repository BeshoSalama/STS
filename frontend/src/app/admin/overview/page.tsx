import Link from "next/link";
import { redirect } from "next/navigation";
import { BriefcaseBusiness, ClipboardList, CreditCard, FileText, Package, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireAdminSession } from "@/lib/rbac";

function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link href={href} className="rounded-lg border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">{label}</p>
      <p className="mt-3 font-display text-4xl font-extrabold text-white">{value}</p>
    </Link>
  );
}

export default async function AdminOverviewPage() {
  if (!(await requireAdminSession())) redirect("/admin/briefs");

  const [clients, staff, admins, leads, briefs, newBriefs, projects, packages, addOns, bookings, pendingPayments, approvedPayments, rejectedPayments, revenue] = await Promise.all([
    db.user.count({ where: { role: "CLIENT" } }),
    db.user.count({ where: { role: "STAFF" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.lead.count(),
    db.brief.count(),
    db.brief.count({ where: { lead: { status: "NEW" } } }),
    db.project.count(),
    db.packagePlan.count(),
    db.packageAddOn.count(),
    db.booking.count(),
    db.paymentTransaction.count({ where: { status: "PENDING" } }),
    db.paymentTransaction.count({ where: { status: "APPROVED" } }),
    db.paymentTransaction.count({ where: { status: "REJECTED" } }),
    db.paymentTransaction.aggregate({ where: { status: "APPROVED" }, _sum: { amount: true } }),
  ]);
  const approvedRevenue = Number(revenue._sum.amount?.toString() ?? 0);

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="font-display text-3xl font-extrabold">Site Management Dashboard</h2>
        <p className="mt-2 text-sm text-white/55">Full admin overview for clients, content, prices, projects, and incoming requests.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Clients" value={clients} href="/admin/clients" />
        <StatCard label="New Briefs" value={newBriefs} href="/admin/briefs" />
        <StatCard label="All Leads" value={leads} href="/admin/leads" />
        <StatCard label="Projects" value={projects} href="/admin/projects" />
        <StatCard label="Packages" value={packages + addOns} href="/admin/packages" />
      </div>

      <Link
        href="/admin/payments?status=PENDING"
        className="group grid gap-5 rounded-lg border border-amber-300/25 bg-amber-400/[0.08] p-5 transition hover:border-amber-200/45 hover:bg-amber-400/[0.12] lg:grid-cols-[1fr_auto]"
      >
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-100">
            <CreditCard size={17} />
            Payment Orders
          </p>
          <h3 className="mt-3 font-display text-3xl font-extrabold text-white">Manage manual payment requests</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/62">
            Review Vodafone Cash and InstaPay submissions, open proof screenshots, approve subscriptions, or reject invalid transfers.
          </p>
        </div>
        <div className="grid min-w-[260px] grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
          <MiniStat label="Pending" value={pendingPayments} tone="text-amber-100" />
          <MiniStat label="Approved" value={approvedPayments} tone="text-emerald-100" />
          <MiniStat label="Rejected" value={rejectedPayments} tone="text-red-100" />
          <MiniStat label="Revenue" value={`${approvedRevenue.toLocaleString()} EGP`} tone="text-violet-100" />
        </div>
      </Link>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h3 className="flex items-center gap-2 font-display text-2xl font-bold">
            <Users size={20} className="text-violet-200" />
            Accounts
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-black/20 p-4"><p className="text-3xl font-bold">{admins}</p><p className="text-xs text-white/45">Admins</p></div>
            <div className="rounded-lg bg-black/20 p-4"><p className="text-3xl font-bold">{staff}</p><p className="text-xs text-white/45">Brief Managers</p></div>
            <div className="rounded-lg bg-black/20 p-4"><p className="text-3xl font-bold">{clients}</p><p className="text-xs text-white/45">Clients</p></div>
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h3 className="flex items-center gap-2 font-display text-2xl font-bold">
            <BriefcaseBusiness size={20} className="text-violet-200" />
            Website Content
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-black/20 p-4"><FileText size={18} /><p className="mt-2 text-2xl font-bold">{projects}</p><p className="text-xs text-white/45">Brands</p></div>
            <div className="rounded-lg bg-black/20 p-4"><Package size={18} /><p className="mt-2 text-2xl font-bold">{packages}</p><p className="text-xs text-white/45">Plans</p></div>
            <div className="rounded-lg bg-black/20 p-4"><Package size={18} /><p className="mt-2 text-2xl font-bold">{addOns}</p><p className="text-xs text-white/45">Add-ons</p></div>
            <div className="rounded-lg bg-black/20 p-4"><ClipboardList size={18} /><p className="mt-2 text-2xl font-bold">{bookings}</p><p className="text-xs text-white/45">Bookings</p></div>
          </div>
        </article>
      </div>
    </section>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/42">{label}</p>
      <p className={`mt-1 font-display text-2xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}
