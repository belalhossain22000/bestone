// offeredCourse.service: Module file for the offeredCourse.service functionality.
import { PrismaClient } from "@prisma/client";

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

// Create a new offered course
const createOfferedCourse = async (payload: any) => {
  const isCourseExist = await prisma.course.findUnique({
    where: { id: payload.courseId },
  });

  if (!isCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }
  const isCourseExistInOfferedCourse = await prisma.offeredCourses.findFirst({
    where: { courseId: payload.courseId },
  });

  if (isCourseExistInOfferedCourse) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Course already offered");
  }
  const result = await prisma.offeredCourses.create({
    data: payload,
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create offered course"
    );
  }
  return result;
};

// Get an offered course by ID
const getOfferedCourseById = async (id: string) => {
  const result = await prisma.offeredCourses.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Offered course not found");
  }
  return result;
};

// Get all offered courses
const getAllOfferedCourses = async () => {
  const result = await prisma.offeredCourses.findMany({
    include: { course: {
      include:{
        institute:true
      }
    } },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "No offered courses found");
  }
  return result;
};

// Update an offered course by ID
const updateOfferedCourse = async (id: string, payload: any) => {
  if (payload.courseId) {
    const isCourseExist = await prisma.course.findUnique({
      where: { id: payload.courseId },
    });

    if (!isCourseExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
    }
  }
  const result = await prisma.offeredCourses.update({
    where: { id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update offered course"
    );
  }
  return result;
};

// Delete an offered course by ID
const deleteOfferedCourse = async (id: string) => {
  const isOfferedCourseExist = await prisma.offeredCourses.findUnique({
    where: { id },
  });

  if (!isOfferedCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Offered course not found");
  }

  const result = await prisma.offeredCourses.delete({
    where: { id },
  });

  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete offered course"
    );
  }
  return result;
};

export {
  createOfferedCourse,
  getOfferedCourseById,
  getAllOfferedCourses,
  updateOfferedCourse,
  deleteOfferedCourse,
};
