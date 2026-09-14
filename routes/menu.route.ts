import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { MenuItemController, CategoryController } from "../controllers/menu.controller.js";
import { authorizeRole } from "../middlewares/auth.middleware.js";

const router = Router();
const itemCtrl = new MenuItemController();
const catCtrl = new CategoryController();

export const getItems = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await itemCtrl.getItems();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await itemCtrl.saveItem(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAllItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await itemCtrl.saveAllItems(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deductStock = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await itemCtrl.deductStock(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await itemCtrl.deleteItem(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetItems = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await itemCtrl.resetItems();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await catCtrl.getCategories();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await catCtrl.saveCategory(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const saveAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await catCtrl.saveAllCategories(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await catCtrl.deleteCategory(req.params.id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const resetCategories = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await catCtrl.resetCategories();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// Items
router.get("/items", getItems);
router.post("/items", saveItem);
router.put("/items/:id", saveItem);
router.post("/items/batch", saveAllItems);
router.post("/items/deduct-stock", deductStock);
router.post("/items/reset", authorizeRole("admin"), resetItems);
router.delete("/items/:id", deleteItem);

// Categories
router.get("/categories", getCategories);
router.post("/categories", saveCategory);
router.post("/categories/batch", saveAllCategories);
router.post("/categories/reset", authorizeRole("admin"), resetCategories);
router.delete("/categories/:id", deleteCategory);

export default router;
