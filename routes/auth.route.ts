import { Router } from "express";
import {
  login,
  getCurrentUser,
  getAccounts,
  saveAccounts,
  resetAccounts,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.get("/me", authenticateToken, getCurrentUser);
router.get("/accounts", getAccounts);
router.post("/accounts", saveAccounts);
router.post("/accounts/reset", resetAccounts);

export default router;
