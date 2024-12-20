// Import necessary modules and configurations
import { Request } from "express";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { courseSearchAbleFields } from "./course.constant";

// Create a new course
const createCourse = async (req: Request) => {
  if (!req.file)
    throw new ApiError(httpStatus.NOT_FOUND, "Thumbnail image is required");

  const thumbUrl = `${config.backend_base_url}/uploads/${req.file?.originalname}`;
  const payload = JSON.parse(req.body.body);

  const isCourseExist = await prisma.course.findUnique({
    where: { title: payload.title },
  });

  if (isCourseExist)
    throw new ApiError(
      httpStatus.CONFLICT,
      `Course with title ${payload.title} already exists`
    );

  const isTeacherExist = await prisma.teacher.findUnique({
    where: { id: payload.teacherId },
  });

  if (!isTeacherExist)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Teacher with id ${payload.teacherId} not found`
    );

  const isCategoryExist = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!isCategoryExist)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Category with id ${payload.categoryId} not found`
    );

  const result = await prisma.course.create({
    data: { ...payload, thumbUrl },
  });

  return result;
};

// Get all courses with optional filtering
const getAllCourses = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andCondions: Prisma.CourseWhereInput[] = [];

  if (params.searchTerm) {
    andCondions.push({
      OR: courseSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditons: Prisma.CourseWhereInput =
    andCondions.length > 0 ? { AND: andCondions } : {};

  const result = await prisma.course.findMany({
    where: whereConditons,
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
    // include:{
    //   Category:true,
    //   Teacher:true,
    //   institute:true
    // }
  });

  const total = await prisma.course.count({
    where: whereConditons,
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

// Get course by ID
const getCourseById = async (courseId: string) => {
  if (!courseId)
    throw new ApiError(httpStatus.BAD_REQUEST, "courseId is required");

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  return course;
};

// Update course
const updateCourse = async (req: Request) => {
  const courseId = req.params.id;
  const thumbUrl = req.file
    ? `${config.backend_base_url}/uploads/${req.file.originalname}`
    : undefined;

  const payload = req.body.body ? JSON.parse(req.body.body) : {};

  if (req.file) payload.thumbUrl = thumbUrl;

  const isCourseExist = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!isCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const result = await prisma.course.update({
    where: { id: courseId },
    data: payload,
  });

  return result;
};

// Get courses by institute
const getCoursesByInstitute = async (instituteId: string) => {
  const result = await prisma.course.findMany({
    where: { instituteId },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No courses found for this institute"
    );
  }

  return result;
};

// Get courses by teacher
const getCoursesByTeacher = async (teacherId: string) => {
  const result = await prisma.course.findMany({
    where: { teacherId },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No courses found for this teacher"
    );
  }

  return result;
};

// Recommend courses by interest
const recommendCoursesByInterest = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const student = await prisma.student.findUnique({
    where: { email: user?.email },
  });

  if (!student || !student.interest) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Student interest not found");
  }

  // Ensure student.interest is parsed correctly
  const interests =
    typeof student.interest === "string"
      ? JSON.parse(student.interest)
      : student.interest;

  if (!Array.isArray(interests)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Student interest is not valid");
  }

  console.log("Student Interests:", interests);

  // Find courses based on interests
  const matchedCourses = await prisma.course.findMany({
    where: {
      OR: interests.map((interest: string) => ({
        OR: [
          { title: { contains: interest, mode: "insensitive" } },
          { description: { contains: interest, mode: "insensitive" } },
          { whatYouWillLearn: { contains: interest, mode: "insensitive" } },
        ],
      })),
    },
    // include: {
    //   Teacher: true,
    //   Category: true,
    //   institute: true,
    // },
  });

  // If no courses match, fetch a few random courses for fallback
  if (matchedCourses.length === 0) {
    const fallbackCourses = await prisma.course.findMany({
      take: 5, // Limit to 5 random courses
      // include: {
      //   Teacher: true,
      //   Category: true,
      //   institute: true,
      // },
    });
    return {
      message: "No courses matched your interests. Here are some recommendations:",
      courses: fallbackCourses,
    };
  }

  // Return matched courses
  return {
    message: "Here are some courses based on your interests:",
    courses: matchedCourses,
  };
};

// Delete course
const deleteCourse = async (courseId: string) => {
  const isCourseExist = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!isCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const result = await prisma.course.delete({
    where: { id: courseId },
  });

  return result;
};

// Export the CourseService
export const CourseService = {
  createCourse,
  getCourseById,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getCoursesByInstitute,
  getCoursesByTeacher,
  recommendCoursesByInterest
};
