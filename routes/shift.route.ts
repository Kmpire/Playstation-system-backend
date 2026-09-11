import { Router } from "express";
import {
  getShiftReports,
  addShiftReport,
  saveAllShiftReports,
  resetShiftReports,
} from "../controllers/shift.controller.js";

const router = Router();

router.get("/", getShiftReports);
router.post("/", addShiftReport);
router.post("/batch", saveAllShiftReports);
router.post("/reset", resetShiftReports);

export default router;
