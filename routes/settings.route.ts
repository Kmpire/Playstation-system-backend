import { Router } from "express";
import { getSetting, setSetting } from "../controllers/settings.controller.js";

const router = Router();

router.get("/:key", getSetting);
router.post("/:key", setSetting);
router.put("/:key", setSetting);

export default router;
