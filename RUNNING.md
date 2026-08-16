# Running STS Agency

## Setup database

```bash
docker compose up -d db
```

The main local database is SQL Server:

```text
Server:   localhost,1433
Database: STSAgency
```

Connection strings are read by the ASP.NET Core API from `SQLSERVER_CONNECTION_STRING`.

## Run frontend only

```bash
npm run frontend
```

Frontend URL:

```text
http://localhost:3000
```

The browser opens automatically when the frontend is ready.

## Run backend API only

```bash
npm run backend
```

Backend URL:

```text
http://localhost:4000
```

The browser opens automatically when the backend Swagger UI is ready.

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

Both browser tabs open automatically when each service is ready.

The frontend sends application data to the standalone ASP.NET Core Web API through `NEXT_PUBLIC_API_URL`.

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
```

Default seeded users:

```text
admin@sts.local / Admin123456!  -> ADMIN
staff@sts.local / Staff123456!  -> STAFF
```
