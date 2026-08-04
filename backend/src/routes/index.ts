import { Router } from "express";
import { loginHandler, registerHandler } from "../controllers/authController";
import { availabilityHandler } from "../controllers/availabilityController";
import { briefLeadHandler, contactLeadHandler, packageQuoteLeadHandler } from "../controllers/leadController";
import { healthHandler, openApiHandler, rootHandler, swaggerHandler } from "../controllers/systemController";

export const router = Router();

router.get("/", rootHandler);
router.get("/health", healthHandler);
router.get("/openapi.json", openApiHandler);
router.get("/api-docs", swaggerHandler);

router.post("/api/auth/register", registerHandler);
router.post("/api/auth/login", loginHandler);

router.get("/api/availability", availabilityHandler);

router.post("/api/leads/contact", contactLeadHandler);
router.post("/api/leads/brief", briefLeadHandler);
router.post("/api/leads/package-quote", packageQuoteLeadHandler);
