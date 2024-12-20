import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { studentSearchAbleFields } from "./student.constant";

// Get all students
const getAllStudents = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.StudentWhereInput[] = [];
  //console.log(filterData);
  if (params.searchTerm) {
    andConditions.push({
      OR: studentSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.StudentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.student.findMany({
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

  const total = await prisma.student.count({
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

// Get a student by ID
const getStudentById = async (id: string) => {
  const result = await prisma.student.findUnique({
    where: { id },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
  }
  return result;
};

// Update a student's information
const updateStudent = async (id: string, payload: any) => {
  const result = await prisma.student.update({
    where: { id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update student"
    );
  }
  return result;
};

// Delete a student by ID
const deleteStudent = async (id: string) => {
  const result = await prisma.student.delete({
    where: { id },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete student"
    );
  }
  return result;
};

export const StudentService = {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
