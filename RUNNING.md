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

The frontend uses `NEXT_PUBLIC_API_URL` when the standalone backend is running, and falls back to the internal Next.js API routes if the backend is offline.
