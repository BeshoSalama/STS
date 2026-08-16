import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Bell, ClipboardList, Mail, Phone, UserRound } from "lucide-react";
import { db } from "@/lib/db";
import { requireStaffSession } from "@/lib/rbac";

async function updateBriefStatus(formData: FormData) {
  "use server";
  if (!(await requireStaffSession())) throw new Error("Unauthorized");
  await db.lead.update({
    where: { id: String(formData.get("leadId") ?? "") },
    data: { status: String(formData.get("status") ?? "NEW") },
  });
  revalidatePath("/admin/briefs");
  revalidatePath("/admin/leads");
}

function parseList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join(", ") : value;
  } catch {
    return value;
  }
}

export default async function AdminBriefsPage() {
  if (!(await requireStaffSession())) redirect("/login");

  const briefs = await db.brief.findMany({
    include: { lead: true, user: true },
    orderBy: { createdAt: "desc" },
  });
  const newCount = briefs.filter((brief) => brief.lead.status === "NEW").length;

  return (
    <section className="grid gap-5">
      <div className="rounded-lg border border-violet-300/20 bg-violet-500/[0.08] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-200">
              <Bell size={16} />
              Website Notifications
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold">Client Briefs Dashboard</h2>
            <p className="mt-2 text-sm text-white/58">Every submitted brief appears here for review, follow-up, and status management.</p>
          </div>
          <div className="rounded-full border border-red-300/30 bg-red-500/15 px-5 py-3 text-sm font-extrabold text-red-100">
            {newCount} New Briefs
          </div>
        </div>
      </div>

      {briefs.map((brief) => (
        <article key={brief.id} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">Brief #{brief.id.slice(-6)}</p>
              <h3 className="mt-1 font-display text-2xl font-bold">{brief.brandName}</h3>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-white/62">
                <span className="inline-flex items-center gap-2"><UserRound size={15} />{brief.clientName}</span>
                <span className="inline-flex items-center gap-2"><Mail size={15} />{brief.email ?? "No email"}</span>
                <span className="inline-flex items-center gap-2"><Phone size={15} />{brief.phone ?? "No phone"}</span>
              </div>
              <p className="mt-2 text-xs text-white/38">Submitted {brief.createdAt.toLocaleString()}</p>
            </div>
            <form action={updateBriefStatus} className="flex gap-2">
              <input type="hidden" name="leadId" value={brief.leadId} />
              <select name="status" defaultValue={brief.lead.status} className="rounded-lg bg-[#16072d] px-3 py-2 text-sm">
                {["NEW", "CONTACTED", "QUALIFIED", "WON", "LOST"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <button className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-bold">Save</button>
            </form>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">Business</p>
              <p className="mt-2 text-sm text-white/78">{brief.businessType || "Not set"}</p>
              <p className="mt-1 text-sm text-white/55">{brief.brandLevel || "No brand level"}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">Goals</p>
              <p className="mt-2 text-sm leading-6 text-white/78">{brief.mainGoals || brief.planObjectives || "Not set"}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/38">Platforms</p>
              <p className="mt-2 text-sm text-white/78">{parseList(brief.socialPlatforms)}</p>
              <p className="mt-1 text-sm text-white/55">{parseList(brief.advertisingPlatforms)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/20 p-4 md:col-span-2 xl:col-span-3">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-white/38">
                <ClipboardList size={15} />
                Notes & Links
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/72">{brief.notes || brief.platformLinks || "No notes submitted."}</p>
            </div>
          </div>
        </article>
      ))}

      {briefs.length === 0 && <p className="rounded-lg border border-white/10 bg-white/[0.04] p-5 text-white/58">No briefs yet.</p>}
    </section>
  );
}
