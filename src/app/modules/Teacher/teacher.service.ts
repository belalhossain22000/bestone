import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { teacherSearchAbleFields } from "./teacher.constant";


// get all teacher search fields and filter and others
const getTeachers = async (params: any, options: IPaginationOptions) => {
  
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.TeacherWhereInput[] = [];
  if (params.searchTerm) {
    andConditions.push({
      OR: teacherSearchAbleFields.map((field) => ({
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

  const whereConditions: Prisma.TeacherWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.teacher.findMany({
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

  const total = await prisma.teacher.count({
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

const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });
  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
  }
  return teacher;
};

// Get teacher by institute
const getTeacherByInstitute = async (instituteId: string) => {
  const result = await prisma.teacher.findMany({
    where: { instituteId },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No teachers found for this institute");
  }

  return result;
};

const getTeacherWithCourses = async (id: string) => {
  const teacherWithCourses = await prisma.teacher.findUnique({
    where: { id },
    include: {
      course: true,
    },
  });

  if (!teacherWithCourses) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher or courses not found");
  }
  return teacherWithCourses;
};

const updateTeacher = async (id: string, payload: any) => {
  const result = await prisma.teacher.update({
    where: { id },
    data: payload,
  });
  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update teacher"
    );
  }
  return result;
};

const deleteTeacher = async (id: string) => {
  const result = await prisma.teacher.delete({
    where: { id },
  });
  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete teacher"
    );
  }
  return result;
};

export const TeacherService = {
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherWithCourses,
  getTeacherByInstitute,
};
