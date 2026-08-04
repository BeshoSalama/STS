import cors from "cors";
import express from "express";
import { router } from "./routes";

const frontendOrigin = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const app = express();

app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(router);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
});
