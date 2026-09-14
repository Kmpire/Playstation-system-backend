import { Router, type Request, type Response, type NextFunction } from "express";
import { SettingsController } from "../controllers/settings.controller.js";
import { optionalAuthenticateToken } from "../middlewares/auth.middleware.js";

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
    const key = String(req.params.key);
    const isLicenseSetting =
      key === "is_activated" || key === "trial_start" || key === "trial_duration_days";

    if (!isLicenseSetting && (!req.user || req.user.role !== "admin")) {
      res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required to modify system settings",
      });
      return;
    }

    const result = await settingsCtrl.setSetting(key, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

router.use(optionalAuthenticateToken);
router.get("/:key", getSetting);
router.post("/:key", setSetting);
router.put("/:key", setSetting);

export default router;
