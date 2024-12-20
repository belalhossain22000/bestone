// admin.service: Module file for the admin.service functionality.

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { adminSearchAbleFields } from "./admin.constant";

// Get all admins
const getAllAdmins = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.AdminWhereInput[] = [];
  //console.log(filterData);
  if (params.searchTerm) {
    andConditions.push({
      OR: adminSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.AdminWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.admin.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    // select: {
    //   id: true,
    //   email: true,
    //   address: true,
    // },
  });

  const total = await prisma.admin.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// Get an admin by ID
const getAdminById = async (id: string) => {
  const result = await prisma.admin.findUnique({
    where: { id },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }
  return result;
};

// Delete an admin by ID
const deleteAdmin = async (id: string) => {
  const result = await prisma.admin.delete({
    where: { id },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete admin"
    );
  }
  return result;
};

export const AdminService = {
  getAllAdmins,
  getAdminById,

  deleteAdmin,
};
