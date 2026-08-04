# Backend API Routes

This file is the code-side API map. Swagger is available when the backend runs at `http://localhost:4000`.

## System

```text
GET /
GET /health
GET /swagger/v1/swagger.json
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
backend/src/STS.Api/Program.cs
backend/src/STS.Api/Controllers/AuthController.cs
backend/src/STS.Api/Controllers/AvailabilityController.cs
backend/src/STS.Api/Controllers/LeadsController.cs
backend/src/STS.Application/
backend/src/STS.Domain/
backend/src/STS.Infrastructure/
frontend/src/components/sections/ContactPanel.tsx
frontend/src/app/brief/page.tsx
frontend/src/components/sections/PackageCards.tsx
frontend/src/components/sections/AuthPanel.tsx
prisma/schema.prisma
prisma/seed.ts
```
