import { Router } from "express";
import {
  getItems,
  saveItem,
  saveAllItems,
  deleteItem,
  resetItems,
  getCategories,
  saveCategory,
  saveAllCategories,
  deleteCategory,
  resetCategories,
} from "../controllers/menu.controller.js";

const router = Router();

// Items
router.get("/items", getItems);
router.post("/items", saveItem);
router.put("/items/:id", saveItem);
router.post("/items/batch", saveAllItems);
router.post("/items/reset", resetItems);
router.delete("/items/:id", deleteItem);

// Categories
router.get("/categories", getCategories);
router.post("/categories", saveCategory);
router.post("/categories/batch", saveAllCategories);
router.post("/categories/reset", resetCategories);
router.delete("/categories/:id", deleteCategory);

export default router;
