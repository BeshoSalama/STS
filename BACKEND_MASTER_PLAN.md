# STS Agency — Backend Master Plan (Ready-to-Execute)

> **الحالة:** تم فحص المشروع بالكامل سطر بسطر (كل الصفحات، كل المكونات، كل ملفات المحتوى، الإعدادات، والـ tooling) بتاريخ 2026-08-04.
> هذا المستند هو **البرومت الكامل الجاهز للتنفيذ** — يقدر أي مهندس أو AI Coding Agent (بما فيه Claude Code في نفس الجلسة) ياخده وينفذه مرحلة بمرحلة من غير ما يحتاج معلومات إضافية.

---

## 0) نتائج الفحص الكامل (Audit Findings)

**Stack الحالي:**
- Next.js 14.2.15 (App Router) + React 18.3 + TypeScript 5.6 (strict mode) + Tailwind 3.4
- GSAP + Lenis للأنيميشن، lucide-react للأيقونات
- Path alias: `@/*` → `src/*`
- Node v24.15.0 / npm 11.12.1 محليًا

**الصفحات الموجودة (كلها Frontend فقط):**
`/` (Home) · `/about` (Team) · `/services` · `/pricing` (باقات + Custom Package Builder) · `/projects` + `/projects/[slug]` (case studies) · `/industries/[slug]` · `/clients` · `/contact` (حجز استشارة) · `/brief` (نموذج بريف عميل ضخم) · `/login` · `/register`

**أهم اكتشاف: لا يوجد Backend إطلاقًا.**
- `AuthPanel.tsx` (تسجيل الدخول/التسجيل): الزرار `type="button"` مش حتى متوصل بـ submit — شكلي 100%.
- `ContactPanel.tsx`: فيه `submitContactForm()` وهمي بيعمل `setTimeout` بس، ومواعيد الحجز (`consultationAvailability.fullyBookedDates`) عبارة عن Array ثابت مكتوب يدويًا في الكود.
- `BriefPage.tsx`: نموذج كبير جدًا (بيانات العميل، البراند، الميزانية، الجمهور، اللغات، المنصات...) بس الـ `handleSubmit` بيعمل `setState` بس ولا يرسل أي حاجة لأي مكان.
- كل المحتوى (`projects`, `industries`, `clients`, `team`, `services`, `packages`, `stats`) hardcoded في `src/lib/content/*.ts` — أي تعديل محتوى = تعديل كود + نشر جديد.
- **لا يوجد Git repository** (`git status` رجّعت "not a git repository"), ولا `.gitignore`, ولا `.env`. في مجلدات كتير زي `.next-bad-*` / `.next-build-ok-*` في الـ root، وده مؤشر إن التتبع بيتم يدويًا بنسخ مجلدات بدل استخدام Git — ده خطر حقيقي على أي مشروع هيضيف قاعدة بيانات وأسرار (secrets).
- مفيش tests، مفيش CI/CD، مفيش تعامل مع الأمان (rate limiting / CSRF / headers).

**الخلاصة:** المطلوب مش "إضافة تفاصيل" على باك اند موجود — المطلوب **بناء باك اند كامل من الصفر** فوق فرونت اند ناضج وجاهز.

---

## 1) القرار المعماري

**التوصية: Modular Monolith داخل نفس مشروع Next.js** باستخدام App Router Route Handlers (`src/app/api/**/route.ts`) بدل عمل backend منفصل (NestJS/Express).

**السبب (كخبرة 10 سنين):**
- المشروع بالفعل Next.js — الـ Route Handlers بتدّيك backend حقيقي (Node runtime) من غير تعقيد نشر إضافي (server منفصل، CORS، Docker orchestration لسيرفرين).
- الحجم المتوقع (موقع وكالة تسويق + بورتال عملاء بسيط) لا يبرر microservices.
- بيدّيك مسار توسّع واضح لاحقًا: أي جزء يكبر (مثلاً توليد PDF ثقيل، أو مزامنة CRM) يتقطع لخدمة منفصلة وقتها بس.

**الـ Stack المُقترح:**
| الطبقة | الاختيار | السبب |
|---|---|---|
| DB | PostgreSQL (Neon serverless للإنتاج، Docker محليًا) | علاقات واضحة (Users/Leads/Bookings)، دعم ممتاز مع Prisma وVercel |
| ORM | Prisma | Type-safe، migrations، الأفضل توافقًا مع TypeScript |
| Auth | Auth.js (NextAuth v5) + Credentials + Prisma Adapter | معياري، جلسات JWT، قابل للتوسع لاحقًا بـ Google/Facebook login |
| Validation | Zod | مشترك بين الفرونت والباك، رسائل خطأ واضحة |
| Email | Resend | API بسيط، deliverability ممتاز، بديل: Nodemailer+SMTP |
| Rate limiting | Upstash Ratelimit (Redis) | يمنع الـ spam على نماذج الليدز العامة |
| File/Image uploads (للأدمن لاحقًا) | Vercel Blob أو Cloudinary | الصور الحالية في `/public` تفضل زي ما هي، الرفع الجديد بس بيتحول |
| Testing | Vitest (unit/integration) + Playwright (e2e) | معيار الصناعة لمشاريع Next.js |
| Deployment | Vercel + Neon | Zero-config مع Next.js |

**قاعدة مهمة:** صفحات المحتوى العامة (Projects/Industries/...) **لا تحتاج REST API** — تتقرأ مباشرة من Prisma جوه Server Components (أسرع وأبسط). الـ REST/Route Handlers تُستخدم فقط لـ: (أ) إرسال النماذج (mutations)، (ب) الـ Auth، (ج) لوحة الأدمن والبورتال.

---

## 2) هيكلة المجلدات الجديدة

```
prisma/
  schema.prisma
  seed.ts
src/
  lib/
    db.ts
    auth.ts
    email.ts
    rateLimit.ts
    validations/
      contact.ts
      brief.ts
      packageQuote.ts
      auth.ts
      project.ts
  app/
    api/
      auth/[...nextauth]/route.ts
      auth/register/route.ts
      leads/contact/route.ts
      leads/brief/route.ts
      leads/package-quote/route.ts
      availability/route.ts
      admin/projects/route.ts
      admin/projects/[id]/route.ts
      admin/industries/... (نفس نمط projects)
      admin/team/...
      admin/clients/...
      admin/packages/...
      admin/leads/route.ts
      admin/availability/route.ts
      portal/briefs/route.ts
      portal/leads/route.ts
      revalidate/route.ts
    admin/
      layout.tsx
      leads/page.tsx
      projects/page.tsx
      ... (نفس الكيانات)
    portal/
      layout.tsx
      page.tsx
middleware.ts
docker-compose.yml
.env.example
.gitignore
```

---

## 3) المرحلة 0 — التأسيس (Git + Tooling) — **لازم أول حاجة**

```bash
git init
```

أنشئ `.gitignore`:

```gitignore
node_modules
.next
.next-*
*.tsbuildinfo
.env
.env*.local
tmp
npm-debug.log*
```

```bash
git add .
git commit -m "chore: initial commit of STS Agency frontend"
```

ثبّت الحزم الأساسية:

```bash
npm install prisma @prisma/client zod bcryptjs
npm install -D @types/bcryptjs tsx
npx prisma init --datasource-provider postgresql
```

`docker-compose.yml` (قاعدة بيانات محلية للتطوير):

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: sts
      POSTGRES_PASSWORD: sts
      POSTGRES_DB: sts_agency
    ports:
      - "5432:5432"
    volumes:
      - sts_pgdata:/var/lib/postgresql/data
volumes:
  sts_pgdata:
```

```bash
docker compose up -d
```

`.env.example` (وانسخه إلى `.env` وعدّل القيم محليًا):

```bash
DATABASE_URL="postgresql://sts:sts@localhost:5432/sts_agency?schema=public"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
RESEND_API_KEY=""
LEADS_NOTIFICATION_EMAIL="sales@stsagency.com"
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

---

## 4) المرحلة 1 — قاعدة البيانات (Prisma Schema كامل)

استبدل محتوى `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CLIENT
  STAFF
  ADMIN
}

enum LeadType {
  CONSULTATION
  BRIEF
  PACKAGE_QUOTE
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  WON
  LOST
}

model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(CLIENT)
  phone        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  leads        Lead[]
  briefs       Brief[]
  bookings     Booking[]
}

model Booking {
  id        String     @id @default(cuid())
  date      DateTime   @db.Date
  name      String
  phone     String
  status    LeadStatus @default(NEW)
  userId    String?
  user      User?      @relation(fields: [userId], references: [id])
  createdAt DateTime   @default(now())

  @@unique([date, phone])
}

model DayCapacity {
  date     DateTime @id @db.Date
  capacity Int      @default(6)
  blocked  Boolean  @default(false)
}

model Lead {
  id        String     @id @default(cuid())
  type      LeadType
  status    LeadStatus @default(NEW)
  name      String
  email     String?
  phone     String
  payload   Json
  userId    String?
  user      User?      @relation(fields: [userId], references: [id])
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model Brief {
  id                         String    @id @default(cuid())
  leadId                     String    @unique
  clientName                 String
  brandName                  String
  briefDate                  DateTime? @db.Date
  email                      String?
  phone                      String
  mainGoals                  String?
  roleModel                  String?
  competitorsLinks           String?
  brandIdentity               String?
  brandLevel                 String?
  customerSegment            String?
  businessType                String?
  socialPlatforms            String[]
  brandSlogan                String?
  preferredColors            String?
  colorNumbers                String?
  toneOfVoice                String[]
  advertisingPlatforms       String[]
  adsBudget                  String?
  targetAge                  String?
  branchesNumber             Int?
  locations                  String?
  gender                     String?
  languages                  String[]
  platformLinks              String?
  notes                      String?
  businessModel              String?
  digitalMarketingExperience String?
  uniqueSellingPoints        String?
  planObjectives              String?
  userId                     String?
  user                       User?    @relation(fields: [userId], references: [id])
  createdAt                  DateTime @default(now())
}

model PackageQuote {
  id        String   @id @default(cuid())
  leadId    String   @unique
  planName  String?
  addOnIds  String[]
  total     Int
  createdAt DateTime @default(now())
}

model Project {
  id        String   @id @default(cuid())
  slug      String   @unique
  name      String
  category  String
  image     String
  imageAlt  String
  details   Json?
  published Boolean  @default(true)
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Industry {
  id          String           @id @default(cuid())
  slug        String           @unique
  name        String
  icon        String
  headline    String
  description String
  clients     IndustryClient[]
}

model IndustryClient {
  id         String   @id @default(cuid())
  industryId String
  industry   Industry @relation(fields: [industryId], references: [id], onDelete: Cascade)
  name       String
  result     String
}

model ClientLogo {
  id             String @id @default(cuid())
  name           String
  category       String
  file           String
  objectPosition String @default("50% 50%")
  size           String @default("md")
  order          Int    @default(0)
}

model TeamMember {
  id    String  @id @default(cuid())
  name  String
  role  String
  photo String?
  order Int     @default(0)
}

model ServiceItem {
  id          String @id @default(cuid())
  icon        String
  eyebrow     String
  title       String
  description String
  cta         String
  order       Int    @default(0)
}

model PackagePlan {
  id          String   @id @default(cuid())
  name        String
  tagline     String
  price       String
  period      String
  description String
  features    String[]
  cta         String
  featured    Boolean  @default(false)
  order       Int      @default(0)
}

model PackageAddOn {
  id          String @id
  label       String
  description String
  price       Int
  order       Int    @default(0)
}

model SiteSettings {
  id      Int    @id @default(1)
  phone   String
  address String
  mapUrl  String
  socials Json
}
```

نفّذ:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

`prisma/seed.ts` (هجّر المحتوى الحالي من `src/lib/content/*.ts` لقاعدة البيانات — مثال بنمط upsert، كرره لباقي الكيانات: `industries` + `IndustryClient` المتداخلة، `team`, `services`, `packagePlans`, `packageAddOns`, `clientLogoImages`):

```ts
import { PrismaClient } from "@prisma/client";
import { projects, getProjectSlug } from "../src/lib/content/projects";

const db = new PrismaClient();

async function main() {
  for (const [i, p] of projects.entries()) {
    await db.project.upsert({
      where: { slug: getProjectSlug(p.name) },
      update: {},
      create: {
        slug: getProjectSlug(p.name),
        name: p.name,
        category: p.category,
        image: p.image,
        imageAlt: p.imageAlt,
        order: i,
      },
    });
  }
  // كرّر نفس المنطق (upsert بترتيب `order`) لـ industries/team/services/packagePlans/packageAddOns/clientLogoImages
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
```

في `package.json` أضف:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio",
    "postinstall": "prisma generate",
    "test": "vitest run",
    "test:e2e": "playwright test"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

```bash
npm run db:seed
```

---

## 5) المرحلة 2 — Auth (تسجيل دخول/حساب حقيقي)

```bash
npm install next-auth@beta @auth/prisma-adapter
```

`src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

`src/lib/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
});
```

`src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
```

`src/lib/validations/auth.ts`:

```ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
});
```

`src/app/api/auth/register/route.ts`:

```ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
  const parsed = registerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({ data: { name, email, passwordHash, role: "CLIENT" } });

  return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
}
```

`middleware.ts` (حماية `/admin` و `/portal`):

```ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as { role?: string } | undefined)?.role;

  if (pathname.startsWith("/admin") && role !== "ADMIN" && role !== "STAFF") {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (pathname.startsWith("/portal") && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
```

**ربط الفرونت (لازم يتعمل، الـ AuthPanel حاليًا شكلي بالكامل):**
عدّل `src/components/sections/AuthPanel.tsx` بحيث يبقى `"use client"` state form فعلي:
- `register`: `POST /api/auth/register` ثم `signIn("credentials", {...})` تلقائيًا وريدايركت لـ `/portal`.
- `login`: `signIn("credentials", { email, password, redirect: false })`، واعرض رسالة خطأ لو فشل، وريدايركت لـ `/portal` لو نجح.
- زرار الـ submit يتحول من `type="button"` إلى `type="submit"` جوه `<form onSubmit={...}>`.

---

## 6) المرحلة 3 — نماذج الليدز (Contact / Brief / Package Quote)

```bash
npm install resend
npm install @upstash/ratelimit @upstash/redis
```

`src/lib/rateLimit.ts`:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const publicFormLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
});

export function getClientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}
```

`src/lib/email.ts`:

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "STS Agency <leads@stsagency.com>";
const TO = process.env.LEADS_NOTIFICATION_EMAIL!;

export async function sendLeadNotification(lead: { type: string; name: string; phone: string; payload: unknown }) {
  await resend.emails.send({
    from: FROM,
    to: TO,
    subject: `New ${lead.type} lead: ${lead.name}`,
    text: `Name: ${lead.name}\nPhone: ${lead.phone}\nDetails:\n${JSON.stringify(lead.payload, null, 2)}`,
  });
}
```

`src/lib/validations/contact.ts`:

```ts
import { z } from "zod";

export const consultationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Invalid phone number"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  honeypot: z.string().max(0).optional(),
});
```

`src/app/api/leads/contact/route.ts` (الحجز آمن ضد الـ race condition — معاملة DB تمنع الحجز المزدوج لنفس اليوم):

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consultationSchema } from "@/lib/validations/contact";
import { publicFormLimiter, getClientIp } from "@/lib/rateLimit";
import { sendLeadNotification } from "@/lib/email";

export async function POST(req: Request) {
  const { success } = await publicFormLimiter.limit(getClientIp(req));
  if (!success) {
    return NextResponse.json({ error: "Too many requests, try again later." }, { status: 429 });
  }

  const parsed = consultationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.honeypot) return NextResponse.json({ ok: true });

  const { name, phone, date } = parsed.data;
  const day = new Date(`${date}T00:00:00.000Z`);

  try {
    const booking = await db.$transaction(
      async (tx) => {
        const dayCapacity = await tx.dayCapacity.findUnique({ where: { date: day } });
        if (dayCapacity?.blocked) throw new Error("DAY_BLOCKED");

        const bookedCount = await tx.booking.count({ where: { date: day } });
        const capacity = dayCapacity?.capacity ?? 6;
        if (bookedCount >= capacity) throw new Error("DAY_FULL");

        return tx.booking.create({ data: { date: day, name, phone } });
      },
      { isolationLevel: "Serializable" }
    );

    const lead = await db.lead.create({ data: { type: "CONSULTATION", name, phone, payload: { date } } });
    await sendLeadNotification(lead).catch(console.error);

    return NextResponse.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    if (err instanceof Error && err.message === "DAY_FULL") {
      return NextResponse.json({ error: "This day is fully booked." }, { status: 409 });
    }
    if (err instanceof Error && err.message === "DAY_BLOCKED") {
      return NextResponse.json({ error: "This day is not available." }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
```

`src/app/api/availability/route.ts` (يستبدل الـ Array الثابت `consultationAvailability.fullyBookedDates`):

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json({ error: "from and to are required" }, { status: 400 });
  }

  const [bookings, blocks] = await Promise.all([
    db.booking.groupBy({ by: ["date"], where: { date: { gte: new Date(from), lte: new Date(to) } }, _count: { _all: true } }),
    db.dayCapacity.findMany({ where: { date: { gte: new Date(from), lte: new Date(to) } } }),
  ]);

  const blockMap = new Map(blocks.map((b) => [b.date.toISOString().slice(0, 10), b]));
  const bookedMap = new Map(bookings.map((b) => [b.date.toISOString().slice(0, 10), b._count._all]));

  const fullyBookedDates = Array.from(new Set([...blockMap.keys(), ...bookedMap.keys()])).filter((key) => {
    const block = blockMap.get(key);
    if (block?.blocked) return true;
    return (bookedMap.get(key) ?? 0) >= (block?.capacity ?? 6);
  });

  return NextResponse.json({ fullyBookedDates });
}
```

نفس النمط بالضبط لـ:
- `src/app/api/leads/brief/route.ts` — Zod schema بكل حقول `BriefPage.tsx` (اعمل `src/lib/validations/brief.ts` بنفس الأسماء بالظبط: `clientName`, `brandName`, `briefDate`, `email`, `phone`, `mainGoals`, ... إلخ)، ثم `db.$transaction` بيعمل `db.lead.create({ type: "BRIEF" })` و `db.brief.create({ leadId: lead.id, ... })` مع بعض، وبعدين إرسال إيميل إشعار.
- `src/app/api/leads/package-quote/route.ts` — يستقبل `{ planName?, addOnIds: string[] }`، يحسب الـ total من `PackageAddOn` جدول DB (متجاهل أي total جاي من الفرونت — الحساب لازم يتم في السيرفر عشان الأمان)، يخزنه في `Lead` + `PackageQuote`.

**ربط الفرونت (المكونات محتاجة تتعدّل فعليًا):**
- `ContactPanel.tsx`: استبدل الـ `submitContactForm` الوهمي بـ `fetch("/api/leads/contact", { method: "POST", body: JSON.stringify(...) })`، واستبدل `import { consultationAvailability }` بجلب `fetch("/api/availability?from=...&to=...")` جوه الـ `useMemo`/`useEffect`. **ملحوظة مهمة:** النموذج الحالي بياخد اسم وتليفون بس بدون إيميل — لو عايزين نبعت Confirmation Email للعميل لازم نضيف حقل إيميل اختياري في النموذج (قرار منتج بسيط، أنصح بيه).
- `BriefPage.tsx`: `handleSubmit` يبقى `async`، يجمع الـ `FormData` من الفورم، ويبعتها لـ `/api/leads/brief`.
- `PackageCards.tsx`: زرار "Request This Package" في `CustomPackageCard` يبعت الاختيارات لـ `/api/leads/package-quote` (بدل ما يوديك على `/contact` مباشرة من غير بيانات)، وبعدها يوديك `/contact` أو يعرض رسالة نجاح.

---

## 7) المرحلة 4 — نقل المحتوى الثابت لقاعدة البيانات (CMS خفيف)

بدّل تنفيذ الدوال في `src/lib/content/*.ts` بحيث تقرأ من Prisma بدل الـ arrays (مع الحفاظ على نفس أسماء الدوال المُستخدَمة في الصفحات، عشان الصفحات نفسها متتغيرش):

`src/lib/content/projects.ts` (مثال — كرر نفس الفكرة لـ industries/team/services/packages/clientLogos):

```ts
import { db } from "@/lib/db";

export function getProjectSlug(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function getProjects() {
  return db.project.findMany({ where: { published: true }, orderBy: { order: "asc" } });
}

export async function getProjectBySlug(slug: string) {
  return db.project.findFirst({ where: { slug, published: true } });
}
```

وفي الصفحات (`src/app/projects/[slug]/page.tsx`, `src/app/projects/page.tsx`, `src/app/industries/[slug]/page.tsx`) حوّل الاستدعاءات لـ `await` وأضف:

```ts
export const revalidate = 3600; // ISR: تحديث كل ساعة
```

عشان الأدمن يقدر يحدّث فورًا بدل ما يستنى الـ revalidate، أضف Webhook بسيط:

`src/app/api/revalidate/route.ts`:

```ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { path } = await req.json();
  revalidatePath(path);
  return NextResponse.json({ revalidated: true });
}
```

---

## 8) المرحلة 5 — لوحة الأدمن (Admin)

كل الكيانات (`Project`, `Industry`, `TeamMember`, `ServiceItem`, `PackagePlan`, `PackageAddOn`, `ClientLogo`) لها نفس نمط الـ CRUD بالظبط. مثال كامل لـ Projects، وكرره لباقي الكيانات:

`src/app/api/admin/projects/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const projectSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  image: z.string().min(1),
  imageAlt: z.string().min(1),
  details: z.any().optional(),
  published: z.boolean().optional(),
  order: z.number().optional(),
});

async function requireStaff() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" || role === "STAFF" ? session : null;
}

export async function GET() {
  return NextResponse.json(await db.project.findMany({ orderBy: { order: "asc" } }));
}

export async function POST(req: Request) {
  if (!(await requireStaff())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = projectSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  return NextResponse.json(await db.project.create({ data: parsed.data }), { status: 201 });
}
```

`src/app/api/admin/projects/[id]/route.ts` (نفس حراسة `requireStaff`، PATCH بـ `projectSchema.partial()`، DELETE بـ `db.project.delete`).

`src/app/api/admin/leads/route.ts` — قائمة الليدز (Contact + Brief + Package Quote) مع فلترة بالـ `status`/`type`، و `PATCH /api/admin/leads/[id]` لتحديث الحالة (NEW → CONTACTED → QUALIFIED → WON/LOST).

`src/app/api/admin/availability/route.ts` — `PATCH` لتعديل/إضافة `DayCapacity` (حجب يوم، أو تغيير الـ capacity).

**واجهة الأدمن (`src/app/admin/**`)**: layout محمي بـ `middleware.ts` (بالفعل معمول أعلاه)، صفحات بسيطة Server Components + Server Actions للتعديل (أبسط من عمل REST calls من كومبوننت React لاستخدام داخلي)، باستخدام نفس مكونات الـ UI الموجودة (`Card`, `Badge`, `Button`) بدل تصميم من الصفر.

---

## 9) المرحلة 6 — بورتال العميل (Growth Portal)

النطاق الأساسي (MVP) بناءً على النص الموجود فعليًا في `AuthPanel.tsx` ("Keep your brand requests, campaign updates, and consultation details in one focused place"):

- `/portal` (محمي، `role: CLIENT`): يعرض بروفايل العميل + قائمة بالبريفات/الليدز اللي بعتها (`GET /api/portal/briefs`, `GET /api/portal/leads`) وحالتها.
- `/portal/profile`: تعديل الاسم/التليفون (`PATCH /api/portal/profile`).

**خارج النطاق حاليًا (Phase مستقبلية، لأنها تحتاج تكامل مع منصات إعلانات حقيقية):** لوحة "Live Performance Dashboard" الظاهرة في صفحات الـ case studies (`projects/[slug]/page.tsx`) حاليًا بيانات ثابتة تسويقية توضيحية. ربطها ببيانات حقيقية لكل عميل يحتاج OAuth مع Meta Ads API / Google Ads API — ده مجهود منفصل وأكبر بكتير، أنصح نأجله لمرحلة لاحقة بعد ما الـ MVP يشتغل ويثبت نفسه.

---

## 10) الأمان (Security Checklist)

- [ ] تشفير الباسورد بـ `bcrypt` (cost 12) — موجود في الكود أعلاه.
- [ ] كل الـ mutations بتتفلتر بـ Zod على السيرفر (مينفعش تتقبل بيانات خام من الفرونت أبدًا).
- [ ] Rate limiting على كل POST عام (`contact`, `brief`, `package-quote`, `register`).
- [ ] Honeypot field في نماذج العامة لمنع البوتات.
- [ ] RBAC عبر `middleware.ts` لكل من `/admin` و `/portal`.
- [ ] أضف Security Headers في `next.config.mjs`:

```js
async headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      ],
    },
  ];
}
```

- [ ] `.env` أبدًا في Git (موجود في `.gitignore` أعلاه).
- [ ] بيانات الـ Brief (بيانات شخصية وتجارية حساسة) — أضف سياسة خصوصية واضحة على `/contact` و `/brief`، وحدد مدة الاحتفاظ بالبيانات.

---

## 11) الاختبارات (Testing)

```bash
npm install -D vitest @vitejs/plugin-react vitest-mock-extended
npm install -D @playwright/test
npx playwright install
```

- Vitest: اختبر كل `validations/*.ts` (زوايا صحيحة وخاطئة)، واختبر منطق الحجز (`DAY_FULL`, `DAY_BLOCKED`) بعمل mock لـ Prisma عبر `vitest-mock-extended`.
- Playwright: e2e لأهم مسار — تعبئة نموذج Contact كامل والتأكد من ظهور رسالة النجاح، وتسجيل حساب جديد ثم تسجيل دخول به.

---

## 12) CI/CD

`.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: sts
          POSTGRES_PASSWORD: sts
          POSTGRES_DB: sts_agency_test
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U sts" --health-interval 10s --health-timeout 5s --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://sts:sts@localhost:5432/sts_agency_test
      - run: npm run lint
      - run: npm run build
        env:
          DATABASE_URL: postgresql://sts:sts@localhost:5432/sts_agency_test
          NEXTAUTH_SECRET: test-secret
      - run: npm test
```

---

## 13) النشر (Deployment)

1. اعمل مشروع Postgres على [Neon](https://neon.tech) وخد الـ `DATABASE_URL`.
2. اربط الريبو بـ Vercel.
3. في إعدادات Vercel أضف كل الـ Environment Variables من `.env.example` (بقيم حقيقية).
4. قبل أول deploy: `npx prisma migrate deploy` (أو أضفها كـ Vercel Build Command: `prisma migrate deploy && next build`).
5. `postinstall: prisma generate` (مضاف بالفعل في `package.json` أعلاه) بيتأكد إن الـ Prisma Client متولد وقت الـ build.

---

## 14) خطة المراحل — ملخص تنفيذي (Roadmap)

| # | المرحلة | الأولوية |
|---|---|---|
| 0 | Git + tooling + Docker Postgres | حرِج — لازم أول حاجة |
| 1 | Prisma schema + migrate + seed من المحتوى الحالي | أساسي |
| 2 | Auth حقيقي (Register/Login) + ربط `AuthPanel.tsx` | أساسي |
| 3 | APIs الليدز (Contact/Brief/Package Quote) + ربط المكونات + Email | أساسي |
| 4 | نقل المحتوى الثابت لقاعدة البيانات + ISR | مهم |
| 5 | لوحة الأدمن (CRUD + Leads inbox + Availability) | مهم |
| 6 | بورتال العميل (MVP: بروفايل + سجل الطلبات) | متوسط |
| 7 | Tests + CI + Security headers | متوسط (لكن لازم قبل أي إنتاج) |
| 8+ | (مستقبلي) تكامل حقيقي مع Meta/Google Ads APIs لداشبورد الأداء | مستقبلي، خارج الـ MVP |

---

## 15) برومت التنفيذ السريع (انسخه لأي Coding Agent)

```
نفّذ خطة الباك اند الموجودة في BACKEND_MASTER_PLAN.md بالترتيب من Phase 0 إلى Phase 7،
مرحلة كاملة قبل ما تنتقل للي بعدها:

1. Phase 0: git init + .gitignore + تثبيت Prisma/Zod/bcrypt + docker-compose للـ Postgres المحلي.
2. Phase 1: طبّق schema.prisma كما هو مكتوب بالظبط، شغّل migrate dev، اكتب seed.ts يهجّر
   كل المحتوى من src/lib/content/*.ts لقاعدة البيانات (كرر نمط upsert لكل الكيانات).
3. Phase 2: أضف Auth.js (NextAuth v5) بالإعداد المكتوب، أنشئ /api/auth/register،
   وعدّل src/components/sections/AuthPanel.tsx فعليًا ليستخدم signIn الحقيقي بدل الزرار الشكلي.
4. Phase 3: أنشئ /api/leads/contact و /api/availability و /api/leads/brief و
   /api/leads/package-quote بالضبط زي الكود المكتوب (مع Zod + rate limiting + email)،
   وعدّل ContactPanel.tsx و BriefPage.tsx و PackageCards.tsx ليستخدموا الـ APIs الحقيقية
   بدل المحاكاة الحالية.
5. Phase 4: حوّل src/lib/content/*.ts لتقرأ من Prisma بدل الـ arrays الثابتة، حافظ على
   نفس أسماء الدوال المُصدَّرة حتى لا تحتاج الصفحات لأي تعديل، وأضف revalidate.
6. Phase 5: أنشئ /admin محمي بالـ middleware، بنفس نمط CRUD الموضح لكل الكيانات + صندوق الليدز.
7. Phase 6: أنشئ /portal بسيط (بروفايل + سجل الطلبات) لليوزر CLIENT.
8. Phase 7: أضف Vitest + Playwright حسب الأمثلة، أضف الـ Security Headers في next.config.mjs،
   وأضف GitHub Actions workflow المكتوب.

بعد كل مرحلة: شغّل `npm run lint` و `npm run build` وتأكد إنهم بينجحوا قبل الانتقال للمرحلة التالية.
لو أي قرار منتج غامض (زي إضافة حقل إيميل لنموذج Contact) اسأل قبل ما تفترض.
```
