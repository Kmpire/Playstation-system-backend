import { Router } from "express";
import {
  getLogs,
  addLog,
  saveAllLogs,
  resetLogs,
} from "../controllers/audit.controller.js";

const router = Router();

router.get("/", getLogs);
router.post("/", addLog);
router.post("/batch", saveAllLogs);
router.post("/reset", resetLogs);

export default router;
