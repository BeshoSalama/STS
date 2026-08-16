import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { db } from "@/lib/db";
import { requireStaffSession } from "@/lib/rbac";
import { isAdmin } from "@/lib/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffSession();
  if (!session) redirect("/login");
  const admin = isAdmin(session.user.role);
  const [newBriefCount, pendingPaymentCount] = await Promise.all([
    db.brief.count({ where: { lead: { status: "NEW" } } }),
    admin ? db.paymentTransaction.count({ where: { status: "PENDING" } }) : Promise.resolve(0),
  ]);

  return (
    <main className="min-h-screen bg-[#080216] pt-28 text-white">
      <div className="container pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-200">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold">STS Back Office</h1>
          </div>
          <nav className="flex flex-wrap justify-end gap-2">
            {admin && (
              <Link href="/admin/overview" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
                Overview
              </Link>
            )}
            <Link href="/admin/briefs" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              Briefs
              {newBriefCount > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{newBriefCount}</span>
              )}
            </Link>
            <Link href="/admin/leads" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              Leads
            </Link>
            {admin && (
              <Link href="/admin/projects" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
                Projects
              </Link>
            )}
            {admin && (
              <Link href="/admin/packages" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
                Packages
              </Link>
            )}
            {admin && (
              <Link href="/admin/payments" className="rounded-full border border-amber-300/25 bg-amber-400/10 px-4 py-2 text-sm font-bold text-amber-50">
                Payment Orders
                {pendingPaymentCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{pendingPaymentCount}</span>
                )}
              </Link>
            )}
            {admin && (
              <Link href="/admin/clients" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
                Clients
              </Link>
            )}
            <Link href="/profile" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              Profile
            </Link>
            <LogoutButton />
          </nav>
        </div>
        {children}
      </div>
    </main>
  );
}
