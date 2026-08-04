import { db } from "@/lib/db";
import { requireClientSession } from "@/lib/rbac";

export default async function PortalPage() {
  const session = await requireClientSession();
  const [leads, briefs] = await Promise.all([
    db.lead.findMany({ where: { userId: session?.user.id }, include: { quote: true }, orderBy: { createdAt: "desc" } }),
    db.brief.findMany({ where: { userId: session?.user.id }, include: { lead: true }, orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-display text-2xl font-bold">Profile</h2>
        <p className="mt-3 text-sm text-white/65">{session?.user.email}</p>
        <p className="mt-1 text-sm text-white/65">Role: {session?.user.role}</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
        <h2 className="font-display text-2xl font-bold">Request History</h2>
        <div className="mt-5 grid gap-3">
          {leads.map((lead) => (
            <article key={lead.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">{lead.type}</p>
              <h3 className="mt-1 font-display text-lg font-bold">{lead.name}</h3>
              <p className="mt-1 text-sm text-white/60">Status: {lead.status}</p>
              {lead.quote && <p className="mt-1 text-sm text-emerald-200">Quote: ${lead.quote.total}</p>}
            </article>
          ))}
          {briefs.map((brief) => (
            <article key={brief.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">BRIEF</p>
              <h3 className="mt-1 font-display text-lg font-bold">{brief.brandName}</h3>
              <p className="mt-1 text-sm text-white/60">Status: {brief.lead.status}</p>
            </article>
          ))}
          {leads.length === 0 && briefs.length === 0 && <p className="text-white/60">No requests yet.</p>}
        </div>
      </div>
    </section>
  );
}
