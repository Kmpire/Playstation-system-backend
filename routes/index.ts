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
import paymentMethodRouter from "./payment-method.route.js";
import paymentRouter from "./payment.route.js";

import { authenticateToken } from "../middlewares/auth.middleware.js";

const apiRouter = Router();

// Authentication and Public/Hybrid Routers
apiRouter.use("/auth", authRouter);
apiRouter.use("/company", companyRouter);
apiRouter.use("/settings", settingsRouter);

// Protected Operational Routers (Requires valid JWT token)
apiRouter.use("/consoles", authenticateToken, consoleRouter);
apiRouter.use("/menu", authenticateToken, menuRouter);
apiRouter.use("/pricing", authenticateToken, pricingRouter);
apiRouter.use("/controllers", authenticateToken, controllerRouter);
apiRouter.use("/shifts", authenticateToken, shiftRouter);
apiRouter.use("/audit", authenticateToken, auditRouter);
apiRouter.use("/payment-methods", authenticateToken, paymentMethodRouter);
apiRouter.use("/payments", authenticateToken, paymentRouter);

// Health check endpoint
apiRouter.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "playstation-system-backend",
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
