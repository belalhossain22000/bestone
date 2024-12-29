// courseProgress.service: Module file for the courseProgress.service functionality.

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createCourseProgress = async (payload: any) => {
  const isCourseExist = await prisma.course.findUnique({
    where: { id: payload.courseId },
  });

  if (!isCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const courseProgress = await prisma.courseCompletion.create({
    data: {
      ...payload,
      status: "NOT_STARTED",
    },
  });
  return courseProgress;
};


// Update course progress
const updateCourseProgress = async (id: string, payload: any) => {
  const isCourseProgressExist = await prisma.courseCompletion.findUnique({
    where: { id },
  });

  if (!isCourseProgressExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course progress not found");
  }

  // Check if the current status is "IN_PROGRESS" and the new status is "NOT_STARTED"
  if (
    isCourseProgressExist.status === "IN_PROGRESS" &&
    payload.status === "NOT_STARTED"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot revert course progress from IN_PROGRESS to NOT_STARTED"
    );
  }

  // Check if the current status is "COMPLETED" and the new status is not "COMPLETED"
  if (
    isCourseProgressExist.status === "COMPLETED" &&
    payload.status !== "COMPLETED"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot revert course progress from COMPLETED to any other status"
    );
  }

  // Check if the current status is "NOT_STARTED" and the new status is "COMPLETED"
  if (
    isCourseProgressExist.status === "NOT_STARTED" &&
    payload.status === "COMPLETED"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot update course progress directly from NOT_STARTED to COMPLETED"
    );
  }

  // Update the completedAt field if the status is "COMPLETED"
  if (payload.status === "COMPLETED") {
    payload.completedAt = new Date();
  }

  const updatedCourseProgress = await prisma.courseCompletion.update({
    where: { id },
    data: payload,
  });

  return updatedCourseProgress;
};

export const CourseProgressService = {
  createCourseProgress,
  updateCourseProgress,
};
