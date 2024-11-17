// category.controller.ts

import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { CategoryService } from "./category.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// Create a new category
const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.createCategoryIntoDb(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Category created successfully!",
    data: result,
  });
});

// category.controller.ts
const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const { search, ...filters } = req.query;

  const result = await CategoryService.getAllCategories(
    search as string,
    filters
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Categories retrieved successfully!",
    data: result,
  });
});

// Get a single category by ID
const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category retrieved successfully!",
    data: result,
  });
});

// Update a category by ID
const updateCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.updateCategoryById(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category updated successfully!",
    data: result,
  });
});

// Delete a category by ID
const deleteCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryService.deleteCategoryById(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Category deleted successfully!",
    data: result,
  });
});

// Export all controller functions
export const CategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
