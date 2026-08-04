import { ArrowDownRight, ArrowUpRight, BarChart3, Bot, Eye, MousePointerClick, RadioTower, Target, TrendingUp, Users } from "lucide-react";
import { db } from "@/lib/db";
import { requireClientSession } from "@/lib/rbac";

type CampaignWithDetails = Awaited<ReturnType<typeof getCampaigns>>[number];

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

async function ensureDashboardData(userId: string) {
  const existing = await db.campaign.count({ where: { userId } });
  if (existing > 0) return;

  const startDate = new Date("2026-05-01T00:00:00.000Z");
  const endDate = new Date("2026-05-31T00:00:00.000Z");
  const daily: Array<[string, number, number, number, number]> = [
    ["2026-05-01", 620, 1280, 9400, 2100],
    ["2026-05-06", 780, 1820, 13400, 2600],
    ["2026-05-11", 910, 2380, 18900, 3100],
    ["2026-05-16", 1120, 2890, 24300, 3600],
    ["2026-05-21", 1410, 3520, 31800, 4200],
    ["2026-05-26", 1680, 4210, 40200, 4700],
    ["2026-05-31", 1980, 4980, 49200, 5200],
  ];

  await db.campaign.create({
    data: {
      userId,
      name: "Summer Sale",
      platform: "Meta Ads",
      status: "ACTIVE",
      budget: 18000,
      spend: 12640,
      revenue: 92300,
      conversions: 1280,
      roas: 7.3,
      conversionRate: 8.7,
      cac: 10,
      impressions: 1240000,
      sessions: 32850,
      startDate,
      endDate,
      dailyMetrics: {
        create: daily.map(([date, conversions, sessions, revenue, spend]) => ({
          date: new Date(`${date}T00:00:00.000Z`),
          conversions,
          sessions,
          revenue,
          spend,
        })),
      },
      trafficSources: {
        create: [
          { source: "Paid Ads", color: "#6d5dfc", sessions: 13140, percentage: 40, conversions: 610 },
          { source: "Organic Search", color: "#22c55e", sessions: 10208, percentage: 31, conversions: 350 },
          { source: "Direct", color: "#f59e0b", sessions: 4270, percentage: 13, conversions: 140 },
          { source: "Social Media", color: "#ec4899", sessions: 3942, percentage: 12, conversions: 130 },
          { source: "Referral", color: "#38bdf8", sessions: 2628, percentage: 8, conversions: 50 },
        ],
      },
      insights: {
        create: [
          { tone: "success", title: "Summer Sale is leading performance", description: "ROAS is above target and revenue keeps climbing week over week." },
          { tone: "warning", title: "Retargeting needs new creatives", description: "CTR is softening. Refresh hooks and offer-led visuals this week." },
          { tone: "info", title: "Organic search is compounding", description: "Search traffic is now the second strongest conversion source." },
        ],
      },
    },
  });

  await db.campaign.create({
    data: {
      userId,
      name: "Brand Awareness",
      platform: "Google + Meta",
      status: "ACTIVE",
      budget: 9000,
      spend: 6840,
      revenue: 22100,
      conversions: 490,
      roas: 3.2,
      conversionRate: 5.1,
      cac: 14,
      impressions: 620000,
      sessions: 14200,
      startDate,
      endDate,
    },
  });
}

async function getCampaigns(userId: string) {
  return db.campaign.findMany({
    where: { userId },
    include: {
      dailyMetrics: { orderBy: { date: "asc" } },
      trafficSources: { orderBy: { sessions: "desc" } },
      insights: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { revenue: "desc" },
  });
}

function trendClass(value: number) {
  return value >= 0 ? "text-emerald-300" : "text-red-300";
}

function KpiCard({
  icon,
  label,
  value,
  trend,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: number;
}) {
  const positive = trend >= 0;
  return (
    <article className="rounded-lg border border-white/10 bg-[#10182a] p-4 shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-500/18 text-violet-200">{icon}</span>
        <span className={`inline-flex items-center gap-1 text-xs font-bold ${trendClass(trend)}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">vs. previous period</p>
    </article>
  );
}

function BarChart({ metrics }: { metrics: CampaignWithDetails["dailyMetrics"] }) {
  const max = Math.max(...metrics.map((metric) => metric.conversions), 1);
  return (
    <div className="mt-5 flex h-56 items-end gap-3 border-b border-slate-700/80 px-2">
      {metrics.map((metric) => {
        const height = Math.max(16, Math.round((metric.conversions / max) * 190));
        return (
          <div key={metric.id} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-violet-800 to-violet-400 shadow-[0_0_20px_rgba(124,92,255,0.28)]"
              style={{ height }}
              title={`${metric.conversions} conversions`}
            />
            <span className="text-[11px] font-semibold text-slate-500">
              {metric.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LineChart({ metrics }: { metrics: CampaignWithDetails["dailyMetrics"] }) {
  const max = Math.max(...metrics.map((metric) => metric.sessions), 1);
  const points = metrics
    .map((metric, index) => {
      const x = (index / Math.max(metrics.length - 1, 1)) * 100;
      const y = 100 - (metric.sessions / max) * 86;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="mt-5 h-56 w-full overflow-visible">
      <defs>
        <linearGradient id="sessionsLine" x1="0" x2="1">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="url(#sessionsLine)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      {points.split(" ").map((point) => {
        const [x, y] = point.split(",");
        return <circle key={point} cx={x} cy={y} r="1.8" fill="#dcfce7" />;
      })}
    </svg>
  );
}

function TrafficRing({ sources }: { sources: CampaignWithDetails["trafficSources"] }) {
  const gradient = sources
    .reduce(
      (parts, source) => {
        const start = parts.total;
        const end = start + source.percentage;
        parts.items.push(`${source.color} ${start}% ${end}%`);
        parts.total = end;
        return parts;
      },
      { total: 0, items: [] as string[] }
    )
    .items.join(", ");

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr] lg:items-center">
      <div
        className="mx-auto grid h-52 w-52 place-items-center rounded-full"
        style={{ background: `radial-gradient(circle at center, #10182a 0 43%, transparent 44%), conic-gradient(${gradient})` }}
      >
        <div className="text-center">
          <p className="font-display text-2xl font-extrabold">{compact.format(sources.reduce((sum, source) => sum + source.sessions, 0))}</p>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Sessions</p>
        </div>
      </div>
      <div className="grid gap-3">
        {sources.map((source) => (
          <div key={source.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 text-sm">
            <span className="flex items-center gap-2 text-slate-200">
              <i className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
              {source.source}
            </span>
            <span className="font-bold text-white">{source.percentage}%</span>
            <span className="text-slate-400">{compact.format(source.sessions)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function PortalPage() {
  const session = await requireClientSession();
  const userId = session!.user.id;
  await ensureDashboardData(userId);

  const [campaigns, leads, briefs] = await Promise.all([
    getCampaigns(userId),
    db.lead.findMany({ where: { userId }, include: { quote: true }, orderBy: { createdAt: "desc" }, take: 4 }),
    db.brief.findMany({ where: { userId }, include: { lead: true }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  const primary = campaigns[0];
  const totals = campaigns.reduce(
    (sum, campaign) => ({
      conversions: sum.conversions + campaign.conversions,
      revenue: sum.revenue + campaign.revenue,
      spend: sum.spend + campaign.spend,
      impressions: sum.impressions + campaign.impressions,
      sessions: sum.sessions + campaign.sessions,
    }),
    { conversions: 0, revenue: 0, spend: 0, impressions: 0, sessions: 0 }
  );
  const roas = totals.spend ? totals.revenue / totals.spend : 0;
  const cac = totals.conversions ? totals.spend / totals.conversions : 0;
  const conversionRate = totals.sessions ? (totals.conversions / totals.sessions) * 100 : 0;

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold">Campaign Dashboard</h2>
          <p className="mt-1 text-sm text-slate-400">Results, campaign health, traffic sources, and next actions.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-[#10182a] px-4 py-3 text-sm font-bold text-slate-200">
          May 1 - May 31, 2026
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <KpiCard icon={<MousePointerClick size={20} />} label="Total Conversions" value={compact.format(totals.conversions)} trend={13.5} />
        <KpiCard icon={<TrendingUp size={20} />} label="Revenue" value={money.format(totals.revenue)} trend={10.2} />
        <KpiCard icon={<Target size={20} />} label="ROAS" value={roas.toFixed(1)} trend={5.3} />
        <KpiCard icon={<Users size={20} />} label="Conv. Rate" value={`${conversionRate.toFixed(1)}%`} trend={-1.3} />
        <KpiCard icon={<RadioTower size={20} />} label="CAC" value={money.format(cac)} trend={-8.6} />
        <KpiCard icon={<Eye size={20} />} label="Impressions" value={compact.format(totals.impressions)} trend={16.7} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-lg border border-white/10 bg-[#10182a] p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-xl font-bold">
              <BarChart3 size={19} className="text-violet-300" />
              Conversions Overview
            </h3>
            <p className="text-right text-sm font-bold text-emerald-300">+13.5%</p>
          </div>
          <BarChart metrics={primary.dailyMetrics} />
        </article>

        <article className="rounded-lg border border-white/10 bg-[#10182a] p-5">
          <h3 className="font-display text-xl font-bold">Traffic Sources</h3>
          <div className="mt-5">
            <TrafficRing sources={primary.trafficSources} />
          </div>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1fr_0.75fr]">
        <article className="rounded-lg border border-white/10 bg-[#10182a] p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl font-bold">Sessions Trend</h3>
            <p className="text-sm font-bold text-emerald-300">{compact.format(totals.sessions)}</p>
          </div>
          <LineChart metrics={primary.dailyMetrics} />
        </article>

        <article className="rounded-lg border border-white/10 bg-[#10182a] p-5">
          <h3 className="font-display text-xl font-bold">Top Campaigns</h3>
          <div className="mt-5 grid gap-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3 text-sm">
                <div>
                  <p className="font-bold text-white">{campaign.name}</p>
                  <p className="text-xs text-slate-500">{campaign.platform}</p>
                </div>
                <span className="font-bold text-slate-200">{money.format(campaign.revenue)}</span>
                <span className="font-bold text-slate-200">{campaign.conversions}</span>
                <span className="font-bold text-emerald-300">{campaign.roas.toFixed(1)}x</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-[#10182a] p-5">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold">
            <Bot size={19} className="text-violet-300" />
            AI Insights
          </h3>
          <div className="mt-5 grid gap-3">
            {primary.insights.map((insight) => (
              <div key={insight.id} className="rounded-lg border border-white/8 bg-white/[0.035] p-3">
                <p className="text-sm font-bold text-white">{insight.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{insight.description}</p>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h3 className="font-display text-xl font-bold">Recent Requests</h3>
          <div className="mt-4 grid gap-3">
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">{lead.type}</p>
                <h4 className="mt-1 font-display text-lg font-bold">{lead.name}</h4>
                <p className="mt-1 text-sm text-white/60">Status: {lead.status}</p>
                {lead.quote && <p className="mt-1 text-sm text-emerald-200">Quote: {money.format(lead.quote.total)}</p>}
              </div>
            ))}
            {leads.length === 0 && <p className="text-sm text-white/60">No requests yet.</p>}
          </div>
        </article>

        <article className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <h3 className="font-display text-xl font-bold">Recent Briefs</h3>
          <div className="mt-4 grid gap-3">
            {briefs.map((brief) => (
              <div key={brief.id} className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-200">BRIEF</p>
                <h4 className="mt-1 font-display text-lg font-bold">{brief.brandName}</h4>
                <p className="mt-1 text-sm text-white/60">Status: {brief.lead.status}</p>
              </div>
            ))}
            {briefs.length === 0 && <p className="text-sm text-white/60">No briefs yet.</p>}
          </div>
        </article>
      </div>
    </section>
  );
}
