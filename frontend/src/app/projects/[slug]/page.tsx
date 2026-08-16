import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type React from "react";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Camera,
  Crown,
  FileText,
  Globe2,
  HeartHandshake,
  LineChart,
  MapPin,
  MessageCircle,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ProjectCaseStudyEditor } from "@/components/projects/ProjectCaseStudyEditor";
import { ProjectMediaManager } from "@/components/projects/ProjectMediaManager";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseProjectCaseStudyData, type ProjectIconKey } from "@/lib/content/projectCaseStudy";
import { getProjectBySlug, getProjectSlug, getProjects } from "@/lib/content/projects";
import { requireAdminSession } from "@/lib/rbac";
import { isAdmin } from "@/lib/roles";
import type { ProjectItem } from "@/types/content";

type DetailProject = ProjectItem & { id?: string; caseStudyData?: string | null };

function sanitizeUploadName(name: string) {
  const extension = path.extname(name).toLowerCase();
  const baseName = path.basename(name, extension).replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "");
  return `${baseName || "media"}-${Date.now()}${extension}`;
}

async function revalidateProjectPaths(slug: string) {
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
}

async function updateProjectCaseStudy(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const caseStudyData = parseProjectCaseStudyData(String(formData.get("caseStudyData") ?? ""));
  let image = String(formData.get("image") ?? "");
  let videoUrl = String(formData.get("videoUrl") ?? "");
  const heroImage = formData.get("heroImage");
  const heroVideo = formData.get("heroVideo");

  if (heroImage instanceof File && heroImage.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", slug, "hero");
    await mkdir(uploadDir, { recursive: true });
    const filename = sanitizeUploadName(heroImage.name);
    await writeFile(path.join(uploadDir, filename), Buffer.from(await heroImage.arrayBuffer()));
    image = `/uploads/projects/${slug}/hero/${filename}`;
  }

  if (heroVideo instanceof File && heroVideo.size > 0) {
    const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", slug, "hero");
    await mkdir(uploadDir, { recursive: true });
    const filename = sanitizeUploadName(heroVideo.name);
    await writeFile(path.join(uploadDir, filename), Buffer.from(await heroVideo.arrayBuffer()));
    videoUrl = `/uploads/projects/${slug}/hero/${filename}`;
  }

  const beforeAfterUploadDir = path.join(process.cwd(), "public", "uploads", "projects", slug, "before-after");
  const beforeAfterItems = await Promise.all(
    caseStudyData.beforeAfter.items.map(async (item, index) => {
      const file = formData.get(`beforeAfterImage-${index}`);
      if (!(file instanceof File) || file.size === 0) return item;
      await mkdir(beforeAfterUploadDir, { recursive: true });
      const filename = sanitizeUploadName(file.name);
      await writeFile(path.join(beforeAfterUploadDir, filename), Buffer.from(await file.arrayBuffer()));
      return { ...item, image: `/uploads/projects/${slug}/before-after/${filename}` };
    })
  );

  await db.project.update({
    where: { id },
    data: {
      image,
      imageAlt: String(formData.get("imageAlt") ?? ""),
      videoUrl,
      caseStudyData: JSON.stringify({
        ...caseStudyData,
        beforeAfter: { ...caseStudyData.beforeAfter, items: beforeAfterItems },
      }),
    },
  });

  await revalidateProjectPaths(slug);
}

async function uploadProjectMedia(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const title = String(formData.get("title") ?? "Brand media");
  const files = formData.getAll("files").filter((file): file is File => file instanceof File && file.size > 0);
  if (!files.length) return;

  const project = await db.project.findUnique({ where: { id }, select: { caseStudyData: true } });
  const caseStudy = parseProjectCaseStudyData(project?.caseStudyData);
  const uploadDir = path.join(process.cwd(), "public", "uploads", "projects", slug);
  await mkdir(uploadDir, { recursive: true });

  const uploadedMedia = await Promise.all(
    files.map(async (file) => {
      const filename = sanitizeUploadName(file.name);
      await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
      return {
        id: `${Date.now()}-${filename}`,
        type: file.type.startsWith("video/") ? ("video" as const) : ("image" as const),
        src: `/uploads/projects/${slug}/${filename}`,
        title: title || file.name,
      };
    })
  );

  await db.project.update({
    where: { id },
    data: {
      caseStudyData: JSON.stringify({
        ...caseStudy,
        contentLibrary: { ...caseStudy.contentLibrary, media: [...caseStudy.contentLibrary.media, ...uploadedMedia] },
      }),
    },
  });

  await revalidateProjectPaths(slug);
}

async function deleteProjectMedia(formData: FormData) {
  "use server";
  if (!(await requireAdminSession())) throw new Error("Admin access required");

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const mediaId = String(formData.get("mediaId") ?? "");
  const mediaSrc = String(formData.get("mediaSrc") ?? "");
  const project = await db.project.findUnique({ where: { id }, select: { caseStudyData: true } });
  const caseStudy = parseProjectCaseStudyData(project?.caseStudyData);
  const media = caseStudy.contentLibrary.media.find((item) => item.id === mediaId || item.src === mediaSrc);

  await db.project.update({
    where: { id },
    data: {
      caseStudyData: JSON.stringify({
        ...caseStudy,
        contentLibrary: {
          ...caseStudy.contentLibrary,
          media: caseStudy.contentLibrary.media.filter((item) => item.id !== mediaId && item.src !== mediaSrc),
        },
      }),
    },
  });

  if (media?.src.startsWith(`/uploads/projects/${slug}/`)) {
    try {
      await unlink(path.join(process.cwd(), "public", media.src.replace(/^\/+/, "")));
    } catch {
    }
  }

  await revalidateProjectPaths(slug);
}

const projectIconMap = {
  calendar: CalendarDays,
  crown: Crown,
  map: MapPin,
  sparkles: Sparkles,
  handshake: HeartHandshake,
  shield: ShieldCheck,
  rocket: Rocket,
  camera: Camera,
  target: Target,
  chart: BarChart3,
  trophy: Trophy,
  message: MessageCircle,
  play: Play,
  users: Users,
} satisfies Record<ProjectIconKey, LucideIcon>;

function ProjectIcon({ name, size = 18, className }: { name: ProjectIconKey; size?: number; className?: string }) {
  const Icon = projectIconMap[name] ?? Sparkles;
  return <Icon size={size} className={className} />;
}

function getCategory(project: DetailProject) {
  return project.category;
}

function getCanonicalSlug(project: DetailProject) {
  return project.slug || getProjectSlug(project.name);
}

function getVideoEmbedUrl(url: string) {
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("youtube.com/watch")) {
    try {
      const videoId = new URL(url.startsWith("http") ? url : `https://${url}`).searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch {
      return url;
    }
  }
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  return url;
}

function AdminTools({ label, meta, children }: { label: string; meta?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 border-y border-violet-200/12 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-100/65">Admin controls</p>
          <p className="mt-1 text-sm font-black text-white">{label}</p>
          {meta && <p className="mt-0.5 text-xs font-semibold text-white/50">{meta}</p>}
        </div>
      </div>
      <div className="mt-3 w-full">{children}</div>
    </div>
  );
}

function CaseSection({
  id,
  eyebrow,
  title,
  description,
  admin,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  admin?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-white/10 py-12">
      {admin}
      <div className="mb-7">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-violet-200/75">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-black leading-tight text-white md:text-5xl">{title}</h2>
        {description && <p className="mt-3 max-w-4xl text-sm font-semibold leading-7 text-white/58">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((project) => ({ slug: getCanonicalSlug(project as DetailProject) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: "Project not found | STS Agency" };
  return {
    title: `${project.name} Case Study | STS Agency`,
    description: `Case study and campaign details for ${project.name}.`,
  };
}

export default async function ProjectDetailsPage({ params }: { params: { slug: string } }) {
  const [project, session] = await Promise.all([getProjectBySlug(params.slug), auth()]);
  if (!project) notFound();

  const detailProject = project as DetailProject;
  const caseStudy = parseProjectCaseStudyData(detailProject.caseStudyData);
  const canEdit = isAdmin(session?.user?.role) && Boolean(detailProject.id);
  const projectSlug = getCanonicalSlug(detailProject);
  const editorProps = {
    projectId: detailProject.id ?? "",
    projectSlug,
    projectName: detailProject.name,
    projectImage: detailProject.image,
    projectImageAlt: detailProject.imageAlt,
    projectVideoUrl: detailProject.videoUrl,
    data: caseStudy,
    action: updateProjectCaseStudy,
  };
  const editButton = (section: "hero" | "journey" | "results" | "campaigns" | "content" | "dashboard" | "people", label: string) =>
    canEdit ? <ProjectCaseStudyEditor {...editorProps} initialSection={section} triggerLabel={label} /> : null;

  return (
    <main dir="rtl" className="min-h-screen bg-[#03060b] pt-28 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_16%_10%,rgba(116,60,255,0.22),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(192,133,64,0.12),transparent_26%),linear-gradient(180deg,#050712_0%,#03060b_100%)]" />

      <div className="container max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/projects" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/78 transition hover:border-violet-300/50 hover:text-white">
            <ArrowLeft size={16} />
            Back to projects
          </Link>
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/55">
            STS Case Study
          </span>
        </div>

        <div className="rounded-[8px] border border-white/10 bg-[linear-gradient(145deg,rgba(8,11,20,0.96),rgba(4,6,12,0.88))] p-5 shadow-card lg:p-8">
          {canEdit && (
            <AdminTools label="Hero section" meta={`${caseStudy.heroMetrics.length} metrics`}>
              {editButton("hero", "Edit hero")}
            </AdminTools>
          )}

          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="relative order-2 min-h-[420px] overflow-hidden rounded-[8px] border border-white/10 bg-black/25 lg:order-1">
              <Image src={detailProject.image} alt={detailProject.imageAlt} fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-contain p-10 lg:p-14" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_36%,rgba(244,190,105,0.14),transparent_32%),linear-gradient(180deg,transparent,rgba(0,0,0,0.44))]" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[8px] border border-white/10 bg-black/42 p-4 backdrop-blur-md">
                <Crown className="mb-2 text-[#f3c66d]" size={28} />
                <p className="font-display text-2xl font-black text-[#f3d28f]">{detailProject.name}</p>
                <p className="mt-1 text-sm font-semibold text-white/58">{getCategory(detailProject)}</p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="mb-5 inline-flex rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-violet-100">
                {caseStudy.hero.badge}
              </span>
              <h1 className="font-display text-5xl font-black leading-[0.98] text-white md:text-7xl">
                {caseStudy.hero.titleTop}
                <br />
                <span className="bg-violet-gradient-text bg-clip-text text-transparent">{caseStudy.hero.titleHighlight}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-white/66">{caseStudy.hero.intro}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#story" className="rounded-full bg-violet-gradient px-6 py-3 text-sm font-black text-white shadow-[0_0_30px_rgba(127,57,251,.34)]">
                  {caseStudy.hero.primaryCta}
                </a>
                <Link href={caseStudy.hero.websiteHref} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white/82">
                  {caseStudy.hero.secondaryCta}
                  <ArrowUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {caseStudy.heroMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center gap-3 rounded-[8px] border border-white/10 bg-white/[0.035] p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-violet-300/25 bg-violet-400/10 text-violet-200">
                  <ProjectIcon name={metric.icon} size={18} />
                </span>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-white/40">{metric.label}</p>
                  <p className="mt-1 text-sm font-black text-white">{metric.useCategory ? getCategory(detailProject) : metric.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="story" className="mt-4">
          <CaseSection
            eyebrow={caseStudy.journey.eyebrow}
            title={caseStudy.journey.title}
            description={caseStudy.journey.description}
            admin={canEdit && <AdminTools label="Journey section" meta={`${caseStudy.journey.items.length} steps`}>{editButton("journey", "Edit journey")}</AdminTools>}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {caseStudy.journey.items.map((item) => (
                <div key={item.title} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/30 bg-violet-400/10 text-violet-200">
                    <ProjectIcon name={item.icon} size={20} />
                  </span>
                  <h3 className="font-display text-lg font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-7 text-white/58">{item.description}</p>
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection
            eyebrow={caseStudy.results.eyebrow}
            title={caseStudy.results.title}
            description={caseStudy.results.description}
            admin={canEdit && <AdminTools label="Results section" meta={`${caseStudy.results.metrics.length} metrics`}>{editButton("results", "Edit results")}</AdminTools>}
          >
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {caseStudy.results.metrics.map((metric) => (
                <div key={metric.label} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5 text-center">
                  <ProjectIcon name={metric.icon} className="mx-auto mb-4 text-violet-200" size={24} />
                  <p className="font-display text-3xl font-black text-violet-200">{metric.value}</p>
                  <p className="mt-2 text-sm font-bold text-white/78">{metric.label}</p>
                  <p className="mt-2 text-xs font-black text-emerald-300">{metric.change}</p>
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection
            eyebrow={caseStudy.beforeAfter.eyebrow}
            title={caseStudy.beforeAfter.title}
            description={caseStudy.beforeAfter.description}
            admin={canEdit && <AdminTools label="Before / After section" meta={`${caseStudy.beforeAfter.items.length} states`}>{editButton("content", "Edit before/after")}</AdminTools>}
          >
            <div className="grid gap-5 lg:grid-cols-2">
              {caseStudy.beforeAfter.items.map((item) => (
                <div key={item.label} className="overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.03]">
                  <div className={`relative aspect-[1.55] ${item.grayscale ? "grayscale" : ""}`}>
                    <Image src={item.image || detailProject.image} alt={detailProject.imageAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain p-8" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,146,255,0.16),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />
                  </div>
                  <div className="grid border-t border-white/10 p-4 text-center sm:grid-cols-3">
                    {item.stats.map((stat) => (
                      <div key={`${item.label}-${stat.label}`}>
                        <p className="font-display text-xl font-black text-white">{stat.value}</p>
                        <p className="text-xs font-semibold text-white/45">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection
            eyebrow={caseStudy.campaigns.eyebrow}
            title={caseStudy.campaigns.title}
            description={caseStudy.campaigns.description}
            admin={canEdit && <AdminTools label="Campaigns section" meta={`${caseStudy.campaigns.items.length} campaigns`}>{editButton("campaigns", "Edit campaigns")}</AdminTools>}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {caseStudy.campaigns.items.map((campaign) => (
                <div key={campaign.title} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
                  <h3 className="font-display text-lg font-black text-white">{campaign.title}</h3>
                  <p className="mt-1 text-xs font-bold text-white/45">Budget {campaign.budget} - Spend {campaign.spend}</p>
                  <div className="mt-4 grid gap-2 text-xs">
                    {campaign.stats.map((item) => (
                      <p key={item} className="rounded-[8px] border border-white/10 bg-black/20 p-2 text-center font-bold text-white/72">{item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection
            eyebrow={caseStudy.contentLibrary.eyebrow}
            title={caseStudy.contentLibrary.title}
            description={caseStudy.contentLibrary.description}
            admin={canEdit && <AdminTools label="Content library" meta={`uploaded media ${caseStudy.contentLibrary.media.length}`}>{editButton("content", "Edit text")}</AdminTools>}
          >
            <div className="mb-5 flex flex-wrap gap-2">
              {caseStudy.contentLibrary.tabs.map((tab, index) => (
                <span key={tab} className={`rounded-full border px-4 py-2 text-xs font-black ${index === 0 ? "border-violet-300/40 bg-violet-400/15 text-violet-100" : "border-white/10 bg-white/[0.03] text-white/50"}`}>
                  {tab}
                </span>
              ))}
            </div>
            <ProjectMediaManager
              media={caseStudy.contentLibrary.media}
              canEdit={canEdit}
              projectId={detailProject.id}
              projectSlug={projectSlug}
              projectImage={detailProject.image}
              projectImageAlt={detailProject.imageAlt}
              placeholderCount={caseStudy.contentLibrary.count}
              uploadAction={uploadProjectMedia}
              deleteAction={deleteProjectMedia}
            />
          </CaseSection>

          <CaseSection
            eyebrow={caseStudy.map.eyebrow}
            title={caseStudy.map.title}
            admin={canEdit && <AdminTools label="Map and dashboard" meta={`${caseStudy.map.locations.length} locations`}>{editButton("dashboard", "Edit dashboard")}</AdminTools>}
          >
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[320px] overflow-hidden rounded-[8px] border border-white/10 bg-[radial-gradient(circle_at_52%_45%,rgba(127,57,251,0.42),transparent_18%),linear-gradient(145deg,rgba(20,16,42,0.8),rgba(4,6,12,0.95))]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[length:48px_48px] opacity-50" />
                <div className="absolute inset-8 rounded-full border border-violet-300/20 blur-sm" />
                <div className="absolute left-[48%] top-[38%] h-28 w-28 rounded-full bg-violet-400/30 blur-2xl" />
              </div>
              <div className="rounded-[8px] border border-white/10 bg-white/[0.03] p-5">
                <h3 className="font-display text-xl font-black text-white">Top Locations</h3>
                <div className="mt-6 space-y-4">
                  {caseStudy.map.locations.map((location) => (
                    <div key={location.city} className="grid grid-cols-[96px_1fr_60px] items-center gap-3 text-sm">
                      <span className="font-bold text-white/70">{location.city}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-white/8">
                        <span className="block h-full rounded-full bg-violet-400" style={{ width: location.width }} />
                      </span>
                      <strong className="text-left text-white">{location.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {caseStudy.dashboard.stats.map((stat) => (
                <div key={stat.label} className="rounded-[8px] border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs font-bold text-white/45">{stat.label}</p>
                  <p className="mt-2 font-display text-3xl font-black text-white">{stat.value}</p>
                  <p className="mt-2 text-xs font-black text-emerald-300">{stat.change}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex h-72 items-end gap-3 rounded-[8px] border border-white/10 bg-white/[0.025] p-5">
              {caseStudy.dashboard.monthly.map((point) => (
                <div key={point.month} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <span className="w-full rounded-t bg-gradient-to-t from-violet-900 to-violet-300" style={{ height: point.height }} />
                  <span className="text-[10px] text-white/45">{point.month}</span>
                </div>
              ))}
            </div>
          </CaseSection>

          <CaseSection
            eyebrow={caseStudy.testimonial.eyebrow}
            title={caseStudy.testimonial.title}
            admin={canEdit && <AdminTools label="People, testimonial, documents" meta={`${caseStudy.team.items.length} team roles`}>{editButton("people", "Edit people")}</AdminTools>}
          >
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="relative aspect-video overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.04]">
                <Image src={detailProject.image} alt={detailProject.imageAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain p-8" />
                <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur">
                  <Play size={22} fill="currentColor" />
                </span>
              </div>
              <div>
                <p className="font-display text-6xl font-black leading-none text-violet-300">&quot;</p>
                <p className="text-lg font-semibold leading-9 text-white/74">{caseStudy.testimonial.quote}</p>
                <p className="mt-5 font-display text-xl font-black text-white">{detailProject.name}</p>
                <p className="text-sm font-semibold text-white/45">{caseStudy.testimonial.authorRole}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {[
                { title: caseStudy.documents.title, icon: FileText, items: caseStudy.documents.items },
                { title: caseStudy.team.title, icon: Users, items: caseStudy.team.items },
                { title: caseStudy.awards.title, icon: Trophy, items: caseStudy.awards.items },
              ].map((group) => (
                <div key={group.title} className="rounded-[8px] border border-white/10 bg-white/[0.03] p-5">
                  <group.icon className="mb-4 text-violet-200" size={30} />
                  <h3 className="font-display text-lg font-black text-white">{group.title}</h3>
                  <div className="mt-4 grid gap-2">
                    {group.items.map((item, index) => (
                      <p key={`${item}-${index}`} className="rounded-[8px] border border-white/10 bg-black/16 px-3 py-2 text-sm font-bold text-white/70">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CaseSection>

          <section className="border-t border-white/10 py-12 text-center">
            <Rocket className="mx-auto mb-5 text-violet-200/70" size={64} />
            <h2 className="font-display text-4xl font-black text-white md:text-5xl">
              Want Results Like This?
              <br />
              <span className="bg-violet-gradient-text bg-clip-text text-transparent">Let us build your success story.</span>
            </h2>
            <Link href="/contact-us" className="mt-7 inline-flex items-center gap-3 rounded-full bg-violet-gradient px-8 py-3 text-sm font-black text-white shadow-[0_0_34px_rgba(127,57,251,.35)]">
              Start now
              <ArrowUpRight size={16} />
            </Link>
          </section>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-center text-sm text-white/45 sm:flex-row">
          <p className="font-display text-2xl font-black text-white">
            STS <span className="text-xs font-medium text-white/45">DIGITAL GROWTH PARTNER</span>
          </p>
          <p>We build brands, growth systems, and measurable impact.</p>
          <div className="flex items-center gap-3">
            <Globe2 size={16} />
            <span>STS Agency</span>
          </div>
        </div>
      </div>
    </main>
  );
}
