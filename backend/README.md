# STS Backend API

Standalone ASP.NET Core Web API for STS Agency, organized with Onion Architecture.

```bash
npm run backend
```

## Folder Map

```text
backend/STS.Backend.slnx
backend/src/STS.Domain/          Core entities
backend/src/STS.Application/     DTOs and service contracts
backend/src/STS.Infrastructure/  EF Core DbContext and services
backend/src/STS.Api/             Controllers, Swagger, CORS
```

Default URL:

```text
http://localhost:4000
```

Database:

```text
SQL Server localhost / STSAgency
```

Health check:

```text
GET /health
```

Swagger:

```text
GET /
GET /swagger/v1/swagger.json
```

Public API endpoints:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/availability
POST /api/leads/contact
POST /api/leads/brief
POST /api/leads/package-quote
```
