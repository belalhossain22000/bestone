// category.service.ts

import { Category } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { Request } from "express";
import config from "../../../config";

// Create a category
const createCategoryIntoDb = async (req: Request) => {
  if (!req.file) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Image is required");
  }
  const payload = JSON.parse(req.body.body);

  const imageUrl = `${config.backend_base_url}/uploads/${req.file?.originalname}`;

  const isCategoryExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });
  if (isCategoryExist) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Category with name ${payload.name} already exists`
    );
  }

  const result = await prisma.category.create({
    data: {
      name: payload.name,
      imageUrl,
    },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create category"
    );
  }

  return result;
};

// Get all categories with optional search and filtering
const getAllCategories = async (
  search?: string,
  filter?: { [key: string]: any }
) => {
  return await prisma.category.findMany({
    where: {
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive", // Makes search case-insensitive
        },
      }),
      ...filter, // Apply additional filters dynamically
    },
  });
};

// Get a category by ID
const getCategoryById = async (id: string) => {
  if (!id)
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Category id is requered");

  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

  return category;
};

// Update a category by ID
const updateCategoryById = async (req: Request) => {
  const id = req.params.id;
  let payload = JSON.parse(req.body.body);
  if (req.file) {
    payload.imageUrl = `${config.backend_base_url}/uploads/${req.file?.originalname}`;
  }
  if (!id)
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Category id is requered");

  const isCategoryExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExist)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Category with id ${id} not found`
    );

  const category = await prisma.category.update({
    where: { id },
    data: payload,
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};

// Delete a category by ID
const deleteCategoryById = async (id: string) => {
  if (!id)
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Category id is requered");

  const isCategoryExist = await prisma.category.findUnique({
    where: { id },
  });

  if (!isCategoryExist)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Category with id ${id} not found`
    );

  const category = await prisma.category.delete({
    where: { id },
  });
  if (!category) {
    throw new ApiError(httpStatus.NOT_FOUND, "Category not found");
  }
  return category;
};

export const CategoryService = {
  createCategoryIntoDb,
  getAllCategories,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
};
