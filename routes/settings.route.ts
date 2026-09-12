import { Router, type Request, type Response, type NextFunction } from "express";
import { SettingsController } from "../controllers/settings.controller.js";

const settingsCtrl = new SettingsController();
const router = Router();

export const getSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await settingsCtrl.getSetting(String(req.params.key));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const setSetting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await settingsCtrl.setSetting(String(req.params.key), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.get("/:key", getSetting);
router.post("/:key", setSetting);
router.put("/:key", setSetting);

export default router;
