import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { requireStaffSession } from "@/lib/rbac";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaffSession();
  if (!session) redirect("/login");

  return (
    <main className="min-h-screen bg-[#080216] pt-28 text-white">
      <div className="container pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-200">Admin</p>
            <h1 className="mt-2 font-display text-4xl font-extrabold">STS Back Office</h1>
          </div>
          <nav className="flex gap-2">
            <Link href="/admin/leads" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              Leads
            </Link>
            <Link href="/admin/projects" className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold">
              Projects
            </Link>
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
