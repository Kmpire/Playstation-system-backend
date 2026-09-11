import { Router } from "express";
import authRouter from "./auth.route.js";
import consoleRouter from "./console.route.js";
import menuRouter from "./menu.route.js";
import pricingRouter from "./pricing.route.js";
import controllerRouter from "./controller.route.js";
import shiftRouter from "./shift.route.js";
import auditRouter from "./audit.route.js";
import companyRouter from "./company.route.js";
import settingsRouter from "./settings.route.js";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/consoles", consoleRouter);
apiRouter.use("/menu", menuRouter);
apiRouter.use("/pricing", pricingRouter);
apiRouter.use("/controllers", controllerRouter);
apiRouter.use("/shifts", shiftRouter);
apiRouter.use("/audit", auditRouter);
apiRouter.use("/company", companyRouter);
apiRouter.use("/settings", settingsRouter);

// Health check endpoint
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "playstation-system-backend",
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
