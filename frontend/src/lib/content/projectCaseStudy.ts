export type ProjectIconKey =
  | "calendar"
  | "crown"
  | "map"
  | "sparkles"
  | "handshake"
  | "shield"
  | "rocket"
  | "camera"
  | "target"
  | "chart"
  | "trophy"
  | "message"
  | "play"
  | "users";

export type HeroMetricItem = {
  label: string;
  value: string;
  icon: ProjectIconKey;
  useCategory?: boolean;
};

export type JourneyItem = {
  title: string;
  description: string;
  icon: ProjectIconKey;
};

export type ResultMetricItem = {
  label: string;
  value: string;
  change: string;
  icon: ProjectIconKey;
};

export type CampaignItem = {
  title: string;
  budget: string;
  spend: string;
  stats: string[];
};

export type BeforeAfterItem = {
  label: string;
  image?: string;
  grayscale?: boolean;
  stats: { label: string; value: string }[];
};

export type MapLocationItem = {
  city: string;
  value: string;
  width: string;
};

export type DashboardStatItem = {
  label: string;
  value: string;
  change: string;
};

export type MonthlyPointItem = {
  month: string;
  height: string;
};

export type MediaItem = {
  id?: string;
  type: "image" | "video";
  src: string;
  title: string;
};

export type ProjectCaseStudyData = {
  hero: {
    badge: string;
    titleTop: string;
    titleHighlight: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
    websiteHref: string;
  };
  heroMetrics: HeroMetricItem[];
  journey: {
    eyebrow: string;
    title: string;
    description: string;
    items: JourneyItem[];
  };
  results: {
    eyebrow: string;
    title: string;
    description: string;
    metrics: ResultMetricItem[];
  };
  beforeAfter: {
    eyebrow: string;
    title: string;
    description: string;
    items: BeforeAfterItem[];
  };
  campaigns: {
    eyebrow: string;
    title: string;
    description: string;
    items: CampaignItem[];
  };
  contentLibrary: {
    eyebrow: string;
    title: string;
    description: string;
    tabs: string[];
    count: number;
    media: MediaItem[];
  };
  map: {
    eyebrow: string;
    title: string;
    locations: MapLocationItem[];
  };
  dashboard: {
    eyebrow: string;
    title: string;
    stats: DashboardStatItem[];
    monthly: MonthlyPointItem[];
  };
  testimonial: {
    eyebrow: string;
    title: string;
    quote: string;
    authorRole: string;
  };
  documents: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  team: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  awards: {
    eyebrow: string;
    title: string;
    items: string[];
  };
};

export const defaultProjectCaseStudyData: ProjectCaseStudyData = {
  hero: {
    badge: "Case Study",
    titleTop: "We Built",
    titleHighlight: "This Brand",
    intro: "From day one until today, we built a real growth story step by step with this brand. This page is ready for final numbers, media, and campaign details.",
    primaryCta: "Explore The Story",
    secondaryCta: "View Website",
    websiteHref: "/contact-us",
  },
  heroMetrics: [
    { label: "Start Date", value: "15 Jan 2024", icon: "calendar" },
    { label: "Industry", value: "Digital Marketing", icon: "crown", useCategory: true },
    { label: "Location", value: "Egypt", icon: "map" },
    { label: "Services", value: "11 Services", icon: "sparkles" },
  ],
  journey: {
    eyebrow: "The Journey",
    title: "Our growth journey with this brand",
    description: "The growth story split into clear phases, from market understanding and identity to campaign execution and results.",
    items: [
      { title: "Partnership Start", description: "Initial analysis, market research, and competitor review.", icon: "handshake" },
      { title: "Visual Identity", description: "Developing a consistent and organized brand look.", icon: "shield" },
      { title: "Social Launch", description: "A clear content plan with regular publishing.", icon: "rocket" },
      { title: "Product Shoots", description: "Professional content photography sessions.", icon: "camera" },
      { title: "Smart Campaigns", description: "Targeted ads based on audience behavior.", icon: "target" },
      { title: "Continuous Growth", description: "Performance optimization and monthly improvements.", icon: "chart" },
    ],
  },
  results: {
    eyebrow: "Results That Speak",
    title: "Numbers that tell the success story",
    description: "Core metrics we track to prove campaign impact on growth, messages, reach, and sales.",
    metrics: [
      { label: "Total Reach", value: "+12.4M", change: "+312%", icon: "chart" },
      { label: "Sales Growth", value: "+385%", change: "+385%", icon: "trophy" },
      { label: "Messages", value: "+14.2K", change: "+278%", icon: "message" },
      { label: "Video Views", value: "+2.1M", change: "+190%", icon: "play" },
      { label: "New Clients", value: "+7.6K", change: "+156%", icon: "users" },
    ],
  },
  beforeAfter: {
    eyebrow: "Before / After",
    title: "Before the partnership and after it",
    description: "A visual comparison that shows the difference between the starting point and the final result.",
    items: [
      {
        label: "Before Partnership",
        grayscale: true,
        stats: [
          { label: "Followers", value: "2.3K" },
          { label: "Engagement", value: "78" },
          { label: "Monthly Reach", value: "12K" },
        ],
      },
      {
        label: "After Partnership",
        stats: [
          { label: "Followers", value: "57.8K" },
          { label: "Engagement", value: "1,842" },
          { label: "Monthly Reach", value: "1.2M" },
        ],
      },
    ],
  },
  campaigns: {
    eyebrow: "Campaigns We Ran",
    title: "Advertising campaigns",
    description: "Compact cards for key campaigns with space for real media and results.",
    items: [
      { title: "Client Launch Campaign", budget: "10,000 EGP", spend: "10,000 EGP", stats: ["ROAS 4.8", "CTR 3.2%", "CPC 1.45 EGP"] },
      { title: "Eid Campaign", budget: "15,000 EGP", spend: "24,000 EGP", stats: ["ROAS 7.1", "CTR 4.1%", "CPC 1.12 EGP"] },
      { title: "New Product Campaign", budget: "20,000 EGP", spend: "32,000 EGP", stats: ["ROAS 7.1", "CTR 4.7%", "CPC 1.12 EGP"] },
      { title: "Black Friday Campaign", budget: "25,000 EGP", spend: "25,000 EGP", stats: ["ROAS 8.3", "CTR 5.6%", "CPC 0.98 EGP"] },
    ],
  },
  contentLibrary: {
    eyebrow: "Content Library",
    title: "Content we created for the brand",
    description: "Organized content library for posts, reels, videos, stories, photography, and motion.",
    tabs: ["All", "Posts", "Reels", "Videos", "Stories", "Photography", "Motion"],
    count: 10,
    media: [],
  },
  map: {
    eyebrow: "Campaign Performance Map",
    title: "Coverage across Egypt",
    locations: [
      { city: "Cairo", value: "38.7K", width: "92%" },
      { city: "Giza", value: "29.4K", width: "78%" },
      { city: "Alexandria", value: "18.6K", width: "58%" },
      { city: "Sharqia", value: "14.2K", width: "46%" },
      { city: "Dakahlia", value: "12.7K", width: "39%" },
    ],
  },
  dashboard: {
    eyebrow: "Live Performance Dashboard",
    title: "Results updated every day",
    stats: [
      { label: "Total Sales", value: "2.54M EGP", change: "+215%" },
      { label: "Total Reach", value: "12.4M", change: "+312%" },
      { label: "Messages", value: "14.2K", change: "+278%" },
      { label: "Conversion Rate", value: "5.23%", change: "+156%" },
    ],
    monthly: [
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
    ],
  },
  testimonial: {
    eyebrow: "Client Testimonial",
    title: "What our client says",
    quote: "STS was a real success partner. They helped us build a strong identity and grow sales clearly, with strong commitment and measurable results.",
    authorRole: "Brand Management",
  },
  documents: {
    eyebrow: "Documents & Strategy",
    title: "Plan and strategy",
    items: ["Brand Strategy", "Content Plan", "Campaign Strategy", "Brand Guidelines", "Photoshoot Plan"],
  },
  team: {
    eyebrow: "The Team Behind The Success",
    title: "The team that made success happen",
    items: ["Account Manager", "Creative Director", "Media Buyer", "Copywriter", "Photographer", "Motion Designer"],
  },
  awards: {
    eyebrow: "Awards & Recognition",
    title: "Awards and recognition",
    items: ["Best Growth", "Highest ROAS", "Best Identity", "Strongest Impact", "Best Content"],
  },
};

export function parseProjectCaseStudyData(value?: string | null): ProjectCaseStudyData {
  if (!value) return defaultProjectCaseStudyData;

  try {
    const parsed = JSON.parse(value) as Partial<ProjectCaseStudyData>;
    return {
      ...defaultProjectCaseStudyData,
      ...parsed,
      hero: { ...defaultProjectCaseStudyData.hero, ...parsed.hero },
      journey: { ...defaultProjectCaseStudyData.journey, ...parsed.journey, items: parsed.journey?.items ?? defaultProjectCaseStudyData.journey.items },
      results: { ...defaultProjectCaseStudyData.results, ...parsed.results, metrics: parsed.results?.metrics ?? defaultProjectCaseStudyData.results.metrics },
      beforeAfter: { ...defaultProjectCaseStudyData.beforeAfter, ...parsed.beforeAfter, items: parsed.beforeAfter?.items ?? defaultProjectCaseStudyData.beforeAfter.items },
      campaigns: { ...defaultProjectCaseStudyData.campaigns, ...parsed.campaigns, items: parsed.campaigns?.items ?? defaultProjectCaseStudyData.campaigns.items },
      contentLibrary: {
        ...defaultProjectCaseStudyData.contentLibrary,
        ...parsed.contentLibrary,
        tabs: parsed.contentLibrary?.tabs ?? defaultProjectCaseStudyData.contentLibrary.tabs,
        media: parsed.contentLibrary?.media ?? defaultProjectCaseStudyData.contentLibrary.media,
      },
      map: { ...defaultProjectCaseStudyData.map, ...parsed.map, locations: parsed.map?.locations ?? defaultProjectCaseStudyData.map.locations },
      dashboard: {
        ...defaultProjectCaseStudyData.dashboard,
        ...parsed.dashboard,
        stats: parsed.dashboard?.stats ?? defaultProjectCaseStudyData.dashboard.stats,
        monthly: parsed.dashboard?.monthly ?? defaultProjectCaseStudyData.dashboard.monthly,
      },
      testimonial: { ...defaultProjectCaseStudyData.testimonial, ...parsed.testimonial },
      documents: { ...defaultProjectCaseStudyData.documents, ...parsed.documents, items: parsed.documents?.items ?? defaultProjectCaseStudyData.documents.items },
      team: { ...defaultProjectCaseStudyData.team, ...parsed.team, items: parsed.team?.items ?? defaultProjectCaseStudyData.team.items },
      awards: { ...defaultProjectCaseStudyData.awards, ...parsed.awards, items: parsed.awards?.items ?? defaultProjectCaseStudyData.awards.items },
    };
  } catch {
    return defaultProjectCaseStudyData;
  }
}
