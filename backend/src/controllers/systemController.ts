import type { Request, Response } from "express";
import { getOpenApiDocument } from "../config/openapi";

export function rootHandler(_req: Request, res: Response) {
  res.json({
    service: "STS Backend API",
    message: "Open the project files in VS Code. API routes are documented in backend/API_ROUTES.md.",
    health: "/health",
    openapi: "/openapi.json",
    swagger: "/api-docs",
  });
}

export function healthHandler(_req: Request, res: Response) {
  res.json({ ok: true, service: "sts-backend" });
}

export function openApiHandler(_req: Request, res: Response) {
  res.json(getOpenApiDocument(Number(process.env.API_PORT ?? 4000)));
}

export function swaggerHandler(_req: Request, res: Response) {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>STS Agency API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>body{margin:0;background:#f7f7f7}.topbar{display:none}</style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: "/openapi.json", dom_id: "#swagger-ui", deepLinking: true, presets: [SwaggerUIBundle.presets.apis] });
    </script>
  </body>
</html>`);
}
