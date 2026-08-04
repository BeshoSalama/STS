export function getOpenApiDocument(port: number) {
  return {
    openapi: "3.0.3",
    info: {
      title: "STS Agency Backend API",
      version: "1.0.0",
      description: "Standalone API for STS Agency leads, auth, availability, and quotes.",
    },
    servers: [{ url: `http://localhost:${port}` }],
    paths: {
      "/health": { get: { tags: ["System"], summary: "Backend health check", responses: { "200": { description: "OK" } } } },
      "/api/auth/register": { post: { tags: ["Auth"], summary: "Register a client account", responses: { "201": { description: "Created" } } } },
      "/api/auth/login": { post: { tags: ["Auth"], summary: "Validate login credentials", responses: { "200": { description: "OK" } } } },
      "/api/availability": { get: { tags: ["Availability"], summary: "Get consultation availability", responses: { "200": { description: "OK" } } } },
      "/api/leads/contact": { post: { tags: ["Leads"], summary: "Book a consultation", responses: { "201": { description: "Created" } } } },
      "/api/leads/brief": { post: { tags: ["Leads"], summary: "Submit a client brief", responses: { "201": { description: "Created" } } } },
      "/api/leads/package-quote": { post: { tags: ["Leads"], summary: "Calculate and save a package quote", responses: { "201": { description: "Created" } } } },
    },
  };
}
