# STS Backend API

Standalone Express API for STS Agency.

```bash
npm run backend
```

## Folder Map

```text
backend/src/server.ts
backend/src/app.ts
backend/src/routes/
backend/src/controllers/
backend/src/services/
backend/src/config/
backend/src/utils/
```

Default URL:

```text
http://localhost:4000
```

Health check:

```text
GET /health
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
