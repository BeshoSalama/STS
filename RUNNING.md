# Running STS Agency

## Setup database

```bash
npm run db:setup
```

## Run frontend only

```bash
npm run frontend
```

Frontend URL:

```text
http://localhost:3000
```

## Run backend API only

```bash
npm run backend
```

Backend URL:

```text
http://localhost:4000
```

Swagger API docs:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/health
```

## Run the full project

```bash
npm run dev
```

This starts:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:4000
```

The frontend uses `NEXT_PUBLIC_API_URL` when the standalone .NET backend is running, and falls back to the internal Next.js API routes if the backend is offline.

## Open the code in VS Code

```bash
code STS.code-workspace
```

Important files:

```text
PROJECT_STRUCTURE.md
backend/API_ROUTES.md
backend/src/STS.Api
backend/src/STS.Application
backend/src/STS.Domain
backend/src/STS.Infrastructure
frontend/src/app
frontend/src/components
prisma/schema.prisma
```
