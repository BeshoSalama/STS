import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Camera,
  CheckCircle2,
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
} from "lucide-react";
import { getProjectSlug, projects } from "@/lib/content/projects";

type DetailProject = (typeof projects)[number];

const arabicCategories: Record<string, string> = {
  "Food & Restaurant": "مطاعم ومأكولات",
  Automotive: "سيارات وخدمات",
  "Butchery & Grill": "جزارة ومشويات",
  "Dental Education": "تعليم طبي",
  "Real Estate Investment": "استثمار عقاري",
  "Dental Clinic": "عيادات أسنان",
  "Medical Clinic": "عيادة طبية",
  "Plastic Surgery": "تجميل وجراحة",
  "Cosmetology & Dermatology": "جلدية وتجميل",
  "Neurosurgery & Spine": "مخ وأعصاب وعمود فقري",
  "Dermatology & Aesthetics": "جلدية وتجميل",
  "Perfume & Fragrance": "عطور وبرفانات",
  "Eye Clinic": "عيادة عيون",
  "Technology & IT": "تكنولوجيا وحلول رقمية",
  "Brand Identity": "هوية تجارية",
  "Pizza & Restaurant": "مطاعم وبيتزا",
  "Real Estate Marketing": "تسويق عقاري",
  "Real Estate Solutions": "حلول عقارية",
  Technology: "تكنولوجيا",
  "Real Estate Company": "شركة عقارية",
};

const heroMetrics = [
  { label: "تاريخ البداية", value: "15 يناير 2024", icon: CalendarDays },
  { label: "المجال", value: "تسويق رقمي", icon: Crown },
  { label: "الموقع", value: "مصر", icon: MapPin },
  { label: "الخدمات", value: "11 خدمة", icon: Sparkles },
];

const journeySteps = [
  ["بداية الشراكة", "تحليل أولي ودراسة السوق والمنافسين", HeartHandshake],
  ["الهوية البصرية", "تطوير شكل ثابت ومنظم للبراند", ShieldCheck],
  ["إطلاق السوشيال", "خطة محتوى واضحة ومنشورات دورية", Rocket],
  ["تصوير المنتجات", "جلسات تصوير احترافية للمحتوى", Camera],
  ["الحملات الذكية", "إعلانات موجهة حسب الجمهور", Target],
  ["النمو المستمر", "تحسين الأداء ورفع النتائج شهريًا", LineChart],
];

const resultMetrics = [
  { label: "إجمالي الوصول", value: "+12.4M", change: "+312%", icon: BarChart3 },
  { label: "زيادة المبيعات", value: "+385%", change: "+385%", icon: Trophy },
  { label: "الرسائل والاستفسارات", value: "+14.2K", change: "+278%", icon: MessageCircle },
  { label: "مشاهدات الفيديو", value: "+2.1M", change: "+190%", icon: Play },
  { label: "عملاء جدد", value: "+7.6K", change: "+156%", icon: Users },
];

const campaignCards = [
  ["حملة إطلاق العميل", "10,000 EGP", "10,000 EGP", "ROAS 4.8", "CTR 3.2%", "CPC 1.45 EGP"],
  ["حملة العيد", "15,000 EGP", "24,000 EGP", "ROAS 7.1", "CTR 4.1%", "CPC 1.12 EGP"],
  ["حملة العطور الجديدة", "20,000 EGP", "32,000 EGP", "ROAS 7.1", "CTR 4.7%", "CPC 1.12 EGP"],
  ["حملة الجمعة البيضاء", "25,000 EGP", "25,000 EGP", "ROAS 8.3", "CTR 5.6%", "CPC 0.98 EGP"],
];

const monthlyPoints = [
  { month: "Jan", height: "24%" },
  { month: "Feb", height: "31%" },
  { month: "Mar", height: "22%" },
  { month: "Apr", height: "38%" },
  { month: "May", height: "61%" },
  { month: "Jun", height: "53%" },
  { month: "Jul", height: "44%" },
  { month: "Aug", height: "59%" },
  { month: "Sep", height: "72%" },
  { month: "Oct", height: "88%" },
  { month: "Nov", height: "78%" },
  { month: "Dec", height: "95%" },
];

const documents = ["Brand Strategy", "Content Plan", "Campaign Strategy", "Brand Guidelines", "Photoshoot Plan"];
const team = ["Account Manager", "Creative Director", "Media Buyer", "Copywriter", "Photographer", "Motion Designer"];
const awards = ["أفضل نمو", "أعلى عائد", "أفضل هوية", "أثر ملحوظ", "أفضل محتوى"];

function getArabicCategory(project: DetailProject) {
  return arabicCategories[project.category] ?? project.category;
}

function getProject(slug: string) {
  return projects.find((project) => getProjectSlug(project.name) === slug);
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: getProjectSlug(project.name) }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const project = getProject(params.slug);

  if (!project) {
    return { title: "Project not found | STS Agency" };
  }

  return {
    title: `${project.name} Case Study | STS Agency`,
    description: `تفاصيل التعاون ونتائج الحملات التسويقية لبراند ${project.name}.`,
  };
}

function CasePanel({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement> & { children: React.ReactNode }) {
  return (
    <section
      {...props}
      className={`relative overflow-hidden rounded-lg border border-white/10 bg-[linear-gradient(145deg,rgba(8,11,20,0.96),rgba(4,6,12,0.88))] p-5 shadow-card backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-violet-300/45 before:to-transparent lg:p-8 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-200/80">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-white md:text-4xl">{title}</h2>
      {description && <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58">{description}</p>}
    </div>
  );
}

function ImageTile({ project, video = false }: { project: DetailProject; video?: boolean }) {
  return (
    <div className="group relative aspect-[1.08] overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
      <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 1024px) 16vw, 45vw" className="object-contain p-5 transition duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(197,145,255,0.22),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.38))]" />
      {video && (
        <span className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur">
          <Play size={18} fill="currentColor" />
        </span>
      )}
    </div>
  );
}

export default function ProjectDetailsPage({ params }: { params: { slug: string } }) {
  const project = getProject(params.slug);

  if (!project) {
    notFound();
  }

  const category = getArabicCategory(project);

  return (
    <main dir="rtl" className="min-h-screen bg-[#03060b] pt-28 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_17%_12%,rgba(116,60,255,0.22),transparent_28%),radial-gradient(circle_at_80%_18%,rgba(192,133,64,0.13),transparent_26%),linear-gradient(180deg,#050712_0%,#03060b_100%)]" />

      <div className="container max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/78 transition hover:border-violet-300/50 hover:text-white"
          >
            <ArrowLeft size={16} />
            العودة للمشاريع
          </Link>
          <span className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            STS Case Study
          </span>
        </div>

        <div className="grid gap-10">
          <CasePanel className="min-h-[620px] p-0 lg:p-0">
            <div className="grid min-h-[620px] gap-0 lg:grid-cols-[0.96fr_1.04fr]">
              <div className="relative order-2 min-h-[420px] overflow-hidden border-t border-white/10 bg-black/25 lg:order-1 lg:border-r lg:border-t-0">
                <Image src={project.image} alt={project.imageAlt} fill priority sizes="(min-width: 1024px) 48vw, 100vw" className="object-contain p-10 lg:p-16" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_36%,rgba(244,190,105,0.16),transparent_32%),linear-gradient(90deg,rgba(0,0,0,0.35),transparent_48%,rgba(0,0,0,0.45))]" />
                <div className="absolute bottom-6 left-6 right-6 rounded-lg border border-white/10 bg-black/35 p-4 backdrop-blur-md">
                  <Crown className="mb-2 text-[#f3c66d]" size={30} />
                  <p className="font-display text-2xl font-bold text-[#f3d28f]">{project.name}</p>
                  <p className="mt-1 text-sm text-white/58">{category}</p>
                </div>
              </div>

              <div className="order-1 flex flex-col justify-center p-6 lg:order-2 lg:p-12">
                <span className="mb-5 w-fit rounded-full border border-white/10 bg-white/[0.045] px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-violet-100">
                  Case Study
                </span>
                <h1 className="font-display text-5xl font-extrabold leading-[0.98] text-white md:text-7xl">
                  We Built
                  <br />
                  This <span className="bg-violet-gradient-text bg-clip-text text-transparent">Brand</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-white/66">
                  من أول يوم لحد النهاردة، رحلة نجاح حقيقية بنيناها مع {project.name} خطوة بخطوة. هذه صفحة مبدئية جاهزة لاستقبال تفاصيل كل براند بالأرقام والصور النهائية.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <a href="#story" className="rounded-full bg-violet-gradient px-6 py-3 text-sm font-bold text-white shadow-[0_0_30px_rgba(127,57,251,.34)]">
                    Explore The Story
                  </a>
                  <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-bold text-white/82">
                    View Website
                    <ArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-3 border-t border-white/10 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
              {heroMetrics.map((metric) => (
                <div key={metric.label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-violet-300/25 bg-violet-400/10 text-violet-200">
                    <metric.icon size={18} />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">{metric.label}</p>
                    <p className="mt-1 text-sm font-bold text-white">{metric.label === "المجال" ? category : metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel id="story">
            <SectionIntro eyebrow="The Journey" title={`رحلة نجاحنا مع ${project.name}`} description="قصة النمو مقسمة لمراحل واضحة، من فهم السوق وبناء الهوية إلى تنفيذ الحملات وقراءة النتائج." />
            <div className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {journeySteps.map(([title, description, Icon]) => (
                <div key={String(title)} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border border-violet-300/30 bg-violet-400/10 text-violet-200 shadow-[0_0_24px_rgba(127,57,251,.2)]">
                    <Icon size={20} />
                  </span>
                  <h3 className="font-display text-lg font-bold text-white">{title as string}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/58">{description as string}</p>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Results That Speak" title="أرقام تحكي النجاح" description="المؤشرات الأساسية التي نتابعها لإثبات أثر الحملات على النمو، الرسائل، الوصول، والمبيعات." />
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {resultMetrics.map((metric) => (
                <div key={metric.label} className="rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_0%,rgba(127,57,251,0.18),transparent_42%),rgba(255,255,255,0.035)] p-5 text-center">
                  <metric.icon className="mx-auto mb-4 text-violet-200" size={24} />
                  <p className="font-display text-3xl font-extrabold text-violet-200">{metric.value}</p>
                  <p className="mt-2 text-sm font-semibold text-white/78">{metric.label}</p>
                  <p className="mt-2 text-xs font-bold text-emerald-300">▲ {metric.change}</p>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Before / After" title="قبل الشراكة وبعدها" description="مقارنة بصرية تساعد العميل يفهم الفرق بين نقطة البداية والنتيجة النهائية بعد تنفيذ نظام المحتوى والحملات." />
            <div className="grid gap-5 lg:grid-cols-2">
              {["قبل الشراكة", "بعد الشراكة"].map((label, index) => (
                <div key={label} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.03]">
                  <div className={`relative aspect-[1.55] ${index === 0 ? "grayscale" : ""}`}>
                    <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain p-8" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,146,255,0.2),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.45))]" />
                  </div>
                  <div className="grid grid-cols-3 border-t border-white/10 p-4 text-center">
                    <div>
                      <p className="font-display text-xl font-bold text-white">{index === 0 ? "2.3K" : "57.8K"}</p>
                      <p className="text-xs text-white/45">متابعين</p>
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold text-white">{index === 0 ? "78" : "1,842"}</p>
                      <p className="text-xs text-white/45">متوسط التفاعل</p>
                    </div>
                    <div>
                      <p className="font-display text-xl font-bold text-white">{index === 0 ? "12K" : "1.2M"}</p>
                      <p className="text-xs text-white/45">الوصول الشهري</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Campaigns We Ran" title="الحملات الإعلانية" description="كروت مختصرة للحملات الأساسية، مع مساحة جاهزة لاحقًا لإضافة الصور والنتائج الحقيقية لكل حملة." />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {campaignCards.map((campaign) => (
                <div key={campaign[0]} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
                  <div className="relative aspect-[1.35]">
                    <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 1280px) 20vw, 45vw" className="object-contain p-5" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,190,105,0.16),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.38))]" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-bold text-white">{campaign[0]}</h3>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                      {campaign.slice(3).map((item) => (
                        <p key={item} className="rounded-md border border-white/10 bg-black/20 p-2 text-center text-white/72">{item}</p>
                      ))}
                    </div>
                    <button className="mt-4 w-full rounded-full border border-white/10 bg-white/[0.04] py-2 text-xs font-bold text-white/76">
                      View Case Study
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Content Library" title="محتوى صنعناه للبراند" description="مكتبة محتوى منظمة للبوستات والريلز والفيديوهات والصور، قابلة للتبديل بصور كل عميل بعدين." />
            <div className="mb-5 flex flex-wrap gap-2">
              {["الكل", "Posts", "Reels", "Videos", "Stories", "Photography", "Motion"].map((tab, index) => (
                <span key={tab} className={`rounded-full border px-4 py-2 text-xs font-bold ${index === 0 ? "border-violet-300/40 bg-violet-400/15 text-violet-100" : "border-white/10 bg-white/[0.03] text-white/50"}`}>
                  {tab}
                </span>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <ImageTile key={index} project={project} video={index % 3 === 1} />
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Campaign Performance Map" title="تغطية كل مكان في مصر" />
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[320px] overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_52%_45%,rgba(127,57,251,0.42),transparent_18%),linear-gradient(145deg,rgba(20,16,42,0.8),rgba(4,6,12,0.95))]">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[length:48px_48px] opacity-50" />
                <div className="absolute inset-8 rounded-full border border-violet-300/20 blur-sm" />
                <div className="absolute left-[48%] top-[38%] h-28 w-28 rounded-full bg-violet-400/30 blur-2xl" />
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                <h3 className="font-display text-xl font-bold text-white">أعلى المحافظات من حيث النتائج</h3>
                <div className="mt-6 space-y-4">
                  {[
                    ["القاهرة", "38.7K", "92%"],
                    ["الجيزة", "29.4K", "78%"],
                    ["الإسكندرية", "18.6K", "58%"],
                    ["الشرقية", "14.2K", "46%"],
                    ["الدقهلية", "12.7K", "39%"],
                  ].map(([city, value, width]) => (
                    <div key={city} className="grid grid-cols-[86px_1fr_52px] items-center gap-3 text-sm">
                      <span className="text-white/70">{city}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-white/8">
                        <span className="block h-full rounded-full bg-violet-400" style={{ width }} />
                      </span>
                      <strong className="text-left text-white">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Live Performance Dashboard" title="نتائج يتم تحديثها كل يوم" />
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["إجمالي المبيعات", "2.54M EGP", "+215%"],
                ["إجمالي الوصول", "12.4M", "+312%"],
                ["الرسائل", "14.2K", "+278%"],
                ["معدل التحويل", "5.23%", "+156%"],
              ].map(([label, value, change]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                  <p className="text-xs text-white/45">{label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-white">{value}</p>
                  <p className="mt-2 text-xs font-bold text-emerald-300">▲ {change}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex h-72 items-end gap-3 rounded-lg border border-white/10 bg-white/[0.025] p-5">
              {monthlyPoints.map((point) => (
                <div key={point.month} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <span className="w-full rounded-t bg-gradient-to-t from-violet-900 to-violet-300 shadow-[0_0_18px_rgba(127,57,251,.22)]" style={{ height: point.height }} />
                  <span className="text-[10px] text-white/45">{point.month}</span>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Client Testimonial" title="عميلنا يقول عن تجربته" />
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                <Image src={project.image} alt={project.imageAlt} fill sizes="(min-width: 1024px) 40vw, 90vw" className="object-contain p-8" />
                <span className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur">
                  <Play size={22} fill="currentColor" />
                </span>
              </div>
              <div>
                <p className="font-display text-6xl font-black leading-none text-violet-300">“</p>
                <p className="text-lg leading-9 text-white/74">
                  شركة STS كانت شريك نجاح حقيقي. ساعدونا في بناء هوية قوية وزيادة مبيعاتنا بشكل ملحوظ، مع التزام واضح ونتائج قابلة للقياس.
                </p>
                <p className="mt-5 font-display text-xl font-bold text-white">{project.name}</p>
                <p className="text-sm text-white/45">إدارة البراند</p>
              </div>
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Documents & Strategy" title="الخطة والاستراتيجية" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {documents.map((document) => (
                <div key={document} className="rounded-lg border border-white/10 bg-white/[0.035] p-5 text-center">
                  <FileText className="mx-auto text-violet-200" size={34} />
                  <h3 className="mt-4 font-display text-sm font-bold text-white">{document}</h3>
                  <p className="mt-1 text-xs text-white/45">PDF</p>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="The Team Behind The Success" title="الفريق الذي صنع النجاح" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {team.map((role, index) => (
                <div key={role} className="rounded-lg border border-white/10 bg-white/[0.035] p-4 text-center">
                  <div className="mx-auto h-20 w-20 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-violet-300/20 to-white/5" />
                  <h3 className="mt-4 font-display text-sm font-bold text-white">{role}</h3>
                  <p className="mt-1 text-xs text-white/45">عضو فريق {index + 1}</p>
                </div>
              ))}
            </div>
          </CasePanel>

          <CasePanel>
            <SectionIntro eyebrow="Awards & Recognition" title="جوائز وترشيحات" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {awards.map((award) => (
                <div key={award} className="rounded-lg border border-white/10 bg-white/[0.03] p-5 text-center">
                  <Trophy className="mx-auto text-violet-200" size={34} />
                  <div className="mt-4 flex justify-center gap-1 text-violet-200">
                    <Star size={13} fill="currentColor" />
                    <Star size={13} fill="currentColor" />
                    <Star size={13} fill="currentColor" />
                  </div>
                  <h3 className="mt-3 font-display text-sm font-bold text-white">{award}</h3>
                </div>
              ))}
            </div>
          </CasePanel>

          <section className="relative overflow-hidden rounded-lg border border-violet-300/20 bg-[radial-gradient(circle_at_84%_54%,rgba(127,57,251,0.34),transparent_25%),linear-gradient(135deg,rgba(15,9,36,0.96),rgba(5,7,13,0.9))] p-8 text-center shadow-card lg:p-12">
            <Rocket className="absolute bottom-6 left-8 hidden text-violet-200/70 lg:block" size={92} />
            <h2 className="font-display text-4xl font-extrabold text-white md:text-5xl">
              Want Results Like This?
              <br />
              Let’s Build Your <span className="bg-violet-gradient-text bg-clip-text text-transparent">Success Story</span>
            </h2>
            <p className="mt-4 text-white/60">جاهز تبدأ رحلتك مع STS وتكون قصتك القادمة؟</p>
            <Link href="/contact" className="mt-7 inline-flex items-center gap-3 rounded-full bg-violet-gradient px-8 py-3 text-sm font-bold text-white shadow-[0_0_34px_rgba(127,57,251,.35)]">
              ابدأ الآن
              <ArrowUpRight size={16} />
            </Link>
          </section>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 py-7 text-center text-sm text-white/45 sm:flex-row">
          <p className="font-display text-2xl font-bold text-white">
            STS <span className="text-xs font-medium text-white/45">DIGITAL GROWTH PARTNER</span>
          </p>
          <p>نبني العلامات التجارية - نصنع النمو - نحقق الأثر</p>
          <div className="flex items-center gap-3">
            <Globe2 size={16} />
            <span>STS Agency</span>
          </div>
        </div>
      </div>
    </main>
  );
}
