// review.service: Module file for the review.service functionality.

import { CourseReview } from "@prisma/client";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const createReview = async (payload: CourseReview) => {
  const result = await prisma.courseReview.create({
    data: payload,
  });
  if (!result)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to create review"
    );
  return result;
};

const getAllReviews = async (query: any) => {
  const { courseId, teacherId, rating } = query;

  const reviews = await prisma.courseReview.findMany({
    where: {
      ...(courseId && { courseId }),
      ...(teacherId && { teacherId }),
      ...(rating && { rating: Number(rating) }),
    },
    include: {
      course: true,
      user: true,
    },
  });

  if (!reviews)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No reviews found for the given criteria"
    );

  return reviews;
};

const getReviewById = async (id: string) => {
  const review = await prisma.courseReview.findUnique({
    where: { id },
    include: {
      course: true,
      user: true,
    },
  });

  if (!review) throw new ApiError(httpStatus.NOT_FOUND, "Review not found");

  return review;
};

const getReviewsByCourseId = async (courseId: string) => {
  if (!courseId)
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Course id is required");

  const isCourseExist = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!isCourseExist)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Course not found with this" + " " + courseId
    );
  const reviews = await prisma.courseReview.findMany({
    where: { courseId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
    },
  });

  if (!reviews.length) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No reviews found for this course"
    );
  }

  return reviews;
};

const updateReview = async (id: string, payload: Partial<CourseReview>) => {
  const existingReview = await prisma.courseReview.findUnique({
    where: { id },
  });

  if (!existingReview)
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");

  const updatedReview = await prisma.courseReview.update({
    where: { id },
    data: payload,
  });

  return updatedReview;
};

const deleteReview = async (id: string) => {
  const review = await prisma.courseReview.findUnique({
    where: { id },
  });

  if (!review) throw new ApiError(httpStatus.NOT_FOUND, "Review not found");

  const result = await prisma.courseReview.delete({
    where: { id },
  });

  return result;
};

export const ReviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByCourseId,
};
