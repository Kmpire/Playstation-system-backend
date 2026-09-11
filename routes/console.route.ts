import { Router } from "express";
import {
  getAllConsoles,
  getConsoleById,
  saveConsole,
  saveAllConsoles,
  deleteConsole,
  resetConsoles,
} from "../controllers/console.controller.js";

const router = Router();

router.get("/", getAllConsoles);
router.post("/reset", resetConsoles);
router.post("/batch", saveAllConsoles);
router.get("/:id", getConsoleById);
router.post("/", saveConsole);
router.put("/:id", saveConsole);
router.delete("/:id", deleteConsole);

export default router;
