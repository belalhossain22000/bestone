import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { instituteSearchAbleFields } from "./institute.constant";
import { Prisma } from "@prisma/client";

// Get all institutes
const getAllInstitutes = async (params: any, options: IPaginationOptions) => {
  
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.InstituteWhereInput[] = [];
  //console.log(filterData);
  if (params.searchTerm) {
    andConditions.push({
      OR: instituteSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.InstituteWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.institute.findMany({
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

  const total = await prisma.institute.count({
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

// Get institute by ID
const getInstituteById = async (id: string) => {
  const institute = await prisma.institute.findUnique({
    where: { id },
  });
  if (!institute) {
    throw new ApiError(httpStatus.NOT_FOUND, "Institute not found");
  }
  return institute;
};

// Get institute with associated courses
const getInstituteWithCourses = async (id: string) => {
  const instituteWithCourses = await prisma.institute.findUnique({
    where: { id },
    include: {
      course: true,
    },
  });
  if (!instituteWithCourses) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Institute not found with courses"
    );
  }
  return instituteWithCourses;
};

// Update an institute by ID
const updateInstitute = async (id: string, data: any) => {
  const institute = await prisma.institute.update({
    where: { id },
    data,
  });
  return institute;
};

// Delete an institute by ID
const deleteInstitute = async (id: string) => {
  await prisma.institute.delete({
    where: { id },
  });
};

export const InstituteService = {
  getAllInstitutes,
  getInstituteById,
  getInstituteWithCourses,
  updateInstitute,
  deleteInstitute,
};
