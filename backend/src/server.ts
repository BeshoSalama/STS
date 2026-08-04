import "dotenv/config";
import cors from "cors";
import express from "express";
import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "@prisma/client";
import { consultationAvailability } from "../../src/lib/content/consultationAvailability";
import { registerSchema, loginSchema } from "../../src/lib/validations/auth";
import { briefSchema } from "../../src/lib/validations/brief";
import { contactSchema } from "../../src/lib/validations/contact";
import { packageQuoteSchema } from "../../src/lib/validations/packageQuote";

const db = new PrismaClient();
const app = express();
const port = Number(process.env.API_PORT ?? 4000);
const frontendOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const DEFAULT_DAY_CAPACITY = 6;
const CUSTOM_PACKAGE_BASE_FEE = 199;
const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "STS Agency Backend API",
    version: "1.0.0",
    description: "Standalone API for STS Agency leads, auth, availability, and quotes.",
  },
  servers: [{ url: `http://localhost:${port}` }],
  tags: [
    { name: "System" },
    { name: "Auth" },
    { name: "Availability" },
    { name: "Leads" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Backend health check",
        responses: {
          "200": {
            description: "API is running",
            content: {
              "application/json": {
                example: { ok: true, service: "sts-backend" },
              },
            },
          },
        },
      },
    },
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a client account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: {
                name: "Jane Client",
                email: "jane@example.com",
                password: "Password123!",
                confirmPassword: "Password123!",
              },
            },
          },
        },
        responses: {
          "201": { description: "Account created" },
          "400": { description: "Validation error" },
          "409": { description: "Email already registered" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Validate login credentials for standalone API use",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: { email: "admin@sts.local", password: "Admin123456!" },
            },
          },
        },
        responses: {
          "200": { description: "Credentials are valid" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/availability": {
      get: {
        tags: ["Availability"],
        summary: "Get consultation availability",
        parameters: [
          { name: "from", in: "query", required: true, schema: { type: "string", example: "2026-08-04" } },
          { name: "to", in: "query", required: true, schema: { type: "string", example: "2026-08-18" } },
        ],
        responses: {
          "200": { description: "Availability days" },
          "400": { description: "Missing date range" },
        },
      },
    },
    "/api/leads/contact": {
      post: {
        tags: ["Leads"],
        summary: "Book a consultation and create a lead",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ContactRequest" },
              example: { name: "Jane Client", phone: "+201001234567", consultationDate: "2026-08-12" },
            },
          },
        },
        responses: {
          "201": { description: "Booking created" },
          "409": { description: "Day full, blocked, or duplicate booking" },
        },
      },
    },
    "/api/leads/brief": {
      post: {
        tags: ["Leads"],
        summary: "Submit a client brief",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BriefRequest" },
              example: {
                clientName: "Jane Client",
                brandName: "Jane Brand",
                phone: "+201001234567",
                email: "jane@example.com",
                socialPlatforms: ["Facebook"],
                toneOfVoice: ["Formal"],
                advertisingPlatforms: ["Google"],
                languages: ["ENG"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Brief saved" },
          "400": { description: "Validation error" },
        },
      },
    },
    "/api/leads/package-quote": {
      post: {
        tags: ["Leads"],
        summary: "Calculate and save a package quote",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PackageQuoteRequest" },
              example: { planName: "Custom Package", addOnIds: ["ads", "seo"] },
            },
          },
        },
        responses: {
          "201": { description: "Quote saved with server-calculated total" },
          "400": { description: "Validation error" },
        },
      },
    },
  },
  components: {
    schemas: {
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password", "confirmPassword"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          confirmPassword: { type: "string", minLength: 8 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      ContactRequest: {
        type: "object",
        required: ["name", "phone", "consultationDate"],
        properties: {
          name: { type: "string" },
          phone: { type: "string" },
          consultationDate: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
          website: { type: "string", description: "Honeypot field" },
        },
      },
      BriefRequest: {
        type: "object",
        required: ["clientName", "brandName", "phone"],
        properties: {
          clientName: { type: "string" },
          brandName: { type: "string" },
          briefDate: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          mainGoals: { type: "string" },
          socialPlatforms: { type: "array", items: { type: "string" } },
          toneOfVoice: { type: "array", items: { type: "string" } },
          advertisingPlatforms: { type: "array", items: { type: "string" } },
          languages: { type: "array", items: { type: "string" } },
        },
      },
      PackageQuoteRequest: {
        type: "object",
        properties: {
          planName: { type: "string" },
          addOnIds: { type: "array", items: { type: "string" } },
          website: { type: "string", description: "Honeypot field" },
        },
      },
    },
  },
};

app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

app.get("/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.get("/api-docs", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>STS Agency API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #f7f7f7; }
      .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    </script>
  </body>
</html>`);
});

function parseDateKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00.000Z`);
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function assertBookable(dateKey: string) {
  const date = parseDateKey(dateKey);
  const capacity = await db.dayCapacity.findUnique({ where: { date } });
  if (capacity?.blocked || consultationAvailability.fullyBookedDates.includes(dateKey)) {
    return { ok: false as const, reason: "DAY_BLOCKED" };
  }

  const bookingCount = await db.booking.count({ where: { date } });
  const dayCapacity = capacity?.capacity ?? DEFAULT_DAY_CAPACITY;
  if (bookingCount >= dayCapacity) return { ok: false as const, reason: "DAY_FULL" };

  return { ok: true as const, date };
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "sts-backend" });
});

app.post("/api/auth/register", async (req, res, next) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return res.status(409).json({ error: "Email is already registered" });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await db.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "CLIENT" },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/auth/login", async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user?.passwordHash) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/availability", async (req, res, next) => {
  try {
    const from = String(req.query.from ?? "");
    const to = String(req.query.to ?? "");
    if (!from || !to) return res.status(400).json({ error: "from and to are required" });

    const fromDate = parseDateKey(from);
    const toDate = parseDateKey(to);
    const capacities = await db.dayCapacity.findMany({ where: { date: { gte: fromDate, lte: toDate } } });
    const bookings = await db.booking.groupBy({
      by: ["date"],
      where: { date: { gte: fromDate, lte: toDate } },
      _count: { _all: true },
    });

    const capacityByDate = new Map(capacities.map((day) => [formatDateKey(day.date), day]));
    const bookingCountByDate = new Map(bookings.map((day) => [formatDateKey(day.date), day._count._all]));
    const staticFullyBooked = new Set(consultationAvailability.fullyBookedDates);
    const days = [];
    const cursor = parseDateKey(from);

    while (cursor <= toDate) {
      const dateKey = formatDateKey(cursor);
      const capacity = capacityByDate.get(dateKey);
      const bookingCount = bookingCountByDate.get(dateKey) ?? 0;
      const maxCapacity = capacity?.capacity ?? DEFAULT_DAY_CAPACITY;
      const blocked = Boolean(capacity?.blocked);
      days.push({
        date: dateKey,
        capacity: maxCapacity,
        booked: bookingCount,
        fullyBooked: blocked || staticFullyBooked.has(dateKey) || bookingCount >= maxCapacity,
        blocked,
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return res.json({ days });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/leads/contact", async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.website) return res.json({ ok: true });

    const bookable = await assertBookable(parsed.data.consultationDate);
    if (!bookable.ok) return res.status(409).json({ error: bookable.reason });

    const result = await db.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: { date: bookable.date, name: parsed.data.name, phone: parsed.data.phone },
      });
      const lead = await tx.lead.create({
        data: {
          type: "CONSULTATION",
          name: parsed.data.name,
          phone: parsed.data.phone,
          payload: JSON.stringify({ consultationDate: parsed.data.consultationDate, bookingId: booking.id }),
        },
      });
      return { booking, lead };
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return res.status(409).json({ error: "DOUBLE_BOOKING" });
    }
    return next(error);
  }
});

app.post("/api/leads/brief", async (req, res, next) => {
  try {
    const parsed = briefSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.website) return res.json({ ok: true });

    const data = parsed.data;
    const result = await db.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          type: "BRIEF",
          name: data.clientName,
          email: data.email || null,
          phone: data.phone,
          payload: JSON.stringify(data),
        },
      });
      const brief = await tx.brief.create({
        data: {
          leadId: lead.id,
          clientName: data.clientName,
          brandName: data.brandName,
          briefDate: data.briefDate ? new Date(`${data.briefDate}T00:00:00.000Z`) : null,
          email: data.email || null,
          phone: data.phone,
          mainGoals: data.mainGoals,
          roleModel: data.roleModel,
          competitorsLinks: data.competitorsLinks,
          brandIdentity: data.brandIdentity,
          brandLevel: data.brandLevel,
          customerSegment: data.customerSegment,
          businessType: data.businessType,
          socialPlatforms: JSON.stringify(data.socialPlatforms),
          brandSlogan: data.brandSlogan,
          preferredColors: data.preferredColors,
          colorNumbers: data.colorNumbers,
          toneOfVoice: JSON.stringify(data.toneOfVoice),
          advertisingPlatforms: JSON.stringify(data.advertisingPlatforms),
          adsBudget: data.adsBudget,
          targetAge: data.targetAge,
          branchesNumber: data.branchesNumber,
          locations: data.locations,
          gender: data.gender,
          languages: JSON.stringify(data.languages),
          platformLinks: data.platformLinks,
          notes: data.notes,
          businessModel: data.businessModel,
          digitalMarketingExperience: data.digitalMarketingExperience,
          uniqueSellingPoints: data.uniqueSellingPoints,
          planObjectives: data.planObjectives,
        },
      });
      return { lead, brief };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

app.post("/api/leads/package-quote", async (req, res, next) => {
  try {
    const parsed = packageQuoteSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    if (parsed.data.website) return res.json({ ok: true });

    const addOns = await db.packageAddOn.findMany({ where: { id: { in: parsed.data.addOnIds } } });
    const total = addOns.reduce((sum, addOn) => sum + addOn.price, CUSTOM_PACKAGE_BASE_FEE);
    const result = await db.$transaction(async (tx) => {
      const lead = await tx.lead.create({
        data: {
          type: "PACKAGE_QUOTE",
          name: "Package Builder",
          phone: "not-provided",
          payload: JSON.stringify({ planName: parsed.data.planName, addOnIds: parsed.data.addOnIds, total }),
        },
      });
      const quote = await tx.packageQuote.create({
        data: {
          leadId: lead.id,
          planName: parsed.data.planName,
          addOnIds: JSON.stringify(addOns.map((addOn) => addOn.id)),
          total,
        },
      });
      return { lead, quote };
    });

    return res.status(201).json(result);
  } catch (error) {
    return next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`STS backend API running on http://localhost:${port}`);
});
