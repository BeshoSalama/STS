# STS Project Structure

Open `STS.code-workspace` in VS Code to see the project split into clear folders.

```text
STS/
  frontend/                React frontend app
    src/app/               Pages and layouts
    src/components/        UI and page sections
    src/lib/               Frontend helpers, auth, validations, content loaders, API client
    public/                Images, logos, favicons
    next.config.mjs
    tailwind.config.ts
    tsconfig.json

  backend/                 ASP.NET Core Web API using Onion Architecture
    STS.Backend.slnx       .NET solution
    src/STS.Domain/        Entities and core domain types
    src/STS.Application/   DTOs, interfaces, application contracts
    src/STS.Infrastructure/EF Core SQL Server persistence and services
    src/STS.Api/           ASP.NET Core controllers, CORS, Swagger
    API_ROUTES.md          Endpoint map
    README.md

  package.json             Root scripts to run frontend/backend together or separately
  STS.code-workspace       VS Code workspace layout
```

## Database

```text
SQL Server: localhost,1433
Database:   STSAgency
```

Roles:

```text
ADMIN  Full back office access, including project CRUD
STAFF  Leads back office access only
CLIENT Portal access and brief submission
```

## Main Commands

```bash
npm run frontend
npm run backend
npm run dev
docker compose up -d db
```
