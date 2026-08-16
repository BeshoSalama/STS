import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaffSession } from "@/lib/rbac";

async function updateLeadStatus(formData: FormData) {
  "use server";
  if (!(await requireStaffSession())) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "NEW");
  await db.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin/briefs");
}

export default async function AdminLeadsPage() {
  const leads = await db.lead.findMany({ include: { brief: true, quote: true }, orderBy: { createdAt: "desc" } });

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <h2 className="font-display text-2xl font-bold">Leads Inbox</h2>
      <div className="mt-5 grid gap-4">
        {leads.map((lead) => (
          <article key={lead.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">{lead.type}</p>
                <h3 className="mt-1 font-display text-xl font-bold">{lead.name}</h3>
                <p className="mt-1 text-sm text-white/65">{lead.email ?? "No email"} | {lead.phone}</p>
                <p className="mt-2 text-xs text-white/45">{lead.createdAt.toLocaleString()}</p>
              </div>
              <form action={updateLeadStatus} className="flex gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <select name="status" defaultValue={lead.status} className="rounded-lg bg-[#16072d] px-3 py-2 text-sm">
                  {["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"].map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-bold">Save</button>
              </form>
            </div>
            {lead.quote && <p className="mt-3 text-sm text-emerald-200">Quote total: ${lead.quote.total}</p>}
            {lead.brief && <p className="mt-3 text-sm text-violet-100">Brief: {lead.brief.brandName}</p>}
            <pre className="mt-3 max-h-40 overflow-auto rounded bg-black/25 p-3 text-xs text-white/60">{lead.payload}</pre>
          </article>
        ))}
        {leads.length === 0 && <p className="text-white/60">No leads yet.</p>}
      </div>
    </section>
  );
}
