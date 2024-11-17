// category.routes.ts
import express from "express";
import { CategoryController } from "./category.controller";
import validateRequest from "../../middlewares/validateRequest";
import { CategoryValidationSchema } from "./category.validation";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

// Route to create a new category
router.post("/", fileUploader.uploadSingle, CategoryController.createCategory);

// Route to get all categories
router.get("/", CategoryController.getAllCategories);

// Route to get a single category by ID
router.get("/:id", CategoryController.getCategoryById);

// Route to update a category by ID
router.put(
  "/:id",
  fileUploader.uploadSingle,
  // validateRequest(CategoryValidationSchema),
  CategoryController.updateCategoryById
);

// Route to delete a category by ID
router.delete("/:id", CategoryController.deleteCategoryById);

export const CategoryRoutes = router;
