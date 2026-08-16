import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isDeveloper, roles } from "@/lib/roles";
import { requireAdminSession, requireDeveloperSession } from "@/lib/rbac";

const inputClass = "min-h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white outline-none";
const manageableRoles = [roles.client, roles.staff, roles.admin, roles.developer];

async function updateUserRole(formData: FormData) {
  "use server";
  if (!(await requireDeveloperSession())) throw new Error("Developer access required");
  const role = String(formData.get("role") ?? roles.client);
  if (!manageableRoles.includes(role as (typeof manageableRoles)[number])) throw new Error("Invalid role");
  await db.user.update({
    where: { id: String(formData.get("id") ?? "") },
    data: { role },
  });
  revalidatePath("/admin/clients");
}

async function deleteUser(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");
  const id = String(formData.get("id") ?? "");
  await db.$transaction(async (tx) => {
    await tx.brief.deleteMany({ where: { userId: id } });
    await tx.booking.deleteMany({ where: { userId: id } });
    await tx.campaign.deleteMany({ where: { userId: id } });
    await tx.lead.updateMany({ where: { userId: id }, data: { userId: null } });
    await tx.session.deleteMany({ where: { userId: id } });
    await tx.account.deleteMany({ where: { userId: id } });
    await tx.user.delete({ where: { id } });
  });
  revalidatePath("/admin/clients");
}

export default async function AdminClientsPage() {
  const session = await requireAdminSession();
  if (!session) redirect("/admin/briefs");
  const canManageRoles = isDeveloper(session.user.role);
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { leads: true, briefs: true, bookings: true, campaigns: true } },
    },
  });

  return (
    <section className="grid gap-5">
      <div>
        <h2 className="font-display text-3xl font-extrabold">Client & Account Management</h2>
        <p className="mt-2 text-sm text-white/55">Developer accounts can promote users, manage roles, and remove accounts.</p>
      </div>

      {users.map((user) => (
        <form key={user.id} action={updateUserRole} className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-5 md:grid-cols-[1.3fr_1fr_auto_auto] md:items-center">
          <input type="hidden" name="id" value={user.id} />
          <div>
            <p className="font-display text-xl font-bold">{user.name ?? "Unnamed user"}</p>
            <p className="mt-1 text-sm text-white/55">{user.email}</p>
            <p className="mt-2 text-xs text-white/38">Joined {user.createdAt.toLocaleString()}</p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <span className="rounded bg-black/20 p-2">{user._count.leads} Leads</span>
            <span className="rounded bg-black/20 p-2">{user._count.briefs} Briefs</span>
            <span className="rounded bg-black/20 p-2">{user._count.bookings} Bookings</span>
            <span className="rounded bg-black/20 p-2">{user._count.campaigns} Campaigns</span>
          </div>
          <select name="role" defaultValue={user.role} disabled={!canManageRoles} className={inputClass}>
            {manageableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button disabled={!canManageRoles} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45">Save Role</button>
            <button formAction={deleteUser} className="rounded-lg border border-red-300/30 px-4 py-2 text-sm font-bold text-red-100">
              Delete
            </button>
          </div>
        </form>
      ))}
    </section>
  );
}
