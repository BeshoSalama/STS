# Backend API Routes

This file is the code-side API map. Open it from VS Code instead of using the browser.

## System

```text
GET /health
```

Checks that the standalone backend is running.

## Auth

```text
POST /api/auth/register
POST /api/auth/login
```

Register validates and creates a client user. Login validates credentials for standalone API use.

## Availability

```text
GET /api/availability?from=2026-08-04&to=2026-08-18
```

Returns consultation day availability.

## Leads

```text
POST /api/leads/contact
POST /api/leads/brief
POST /api/leads/package-quote
```

Creates consultation bookings, client briefs, and package quotes in the database.

## Source Files

```text
backend/src/server.ts
backend/src/app.ts
backend/src/routes/index.ts
backend/src/controllers/authController.ts
backend/src/controllers/availabilityController.ts
backend/src/controllers/leadController.ts
backend/src/services/bookingService.ts
frontend/src/components/sections/ContactPanel.tsx
frontend/src/app/brief/page.tsx
frontend/src/components/sections/PackageCards.tsx
frontend/src/components/sections/AuthPanel.tsx
prisma/schema.prisma
prisma/seed.ts
```
