# STS Project Structure

Open `STS.code-workspace` in VS Code to see the project split into clear folders.

```text
STS/
  frontend/                Next.js frontend app
    src/app/               Pages, layouts, API route fallbacks
    src/components/        UI and page sections
    src/lib/               Frontend helpers, auth, validations, content loaders
    public/                Images, logos, favicons
    next.config.mjs
    tailwind.config.ts
    tsconfig.json

  backend/                 Standalone Express API
    src/server.ts          Starts the API server
    src/app.ts             Express app setup
    src/routes/            API route registration
    src/controllers/       Request handlers
    src/services/          Business logic
    src/config/            DB and OpenAPI config
    src/utils/             Shared backend utilities
    scripts/setup-db.ts    Local database setup helper
    API_ROUTES.md          Endpoint map
    README.md

  prisma/                  Shared database layer
    schema.prisma          Database schema
    seed.ts                Seed data from frontend content
    migrations/            SQL migration

  package.json             Root scripts to run frontend/backend together or separately
  STS.code-workspace       VS Code workspace layout
```

## Main Commands

```bash
npm run frontend
npm run backend
npm run dev
npm run db:setup
```
