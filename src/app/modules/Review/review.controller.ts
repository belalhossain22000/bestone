// review.controller: Module file for the review.controller functionality.
import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { ReviewService } from "./review.service";

// Create a new review
const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.body,req.user );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Review created successfully!",
    data: result,
  });
});

// Get all reviews
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reviews retrieved successfully!",
    data: result,
  });
});

// Get review by ID
const getReviewById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.getReviewById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review retrieved successfully!",
    data: result,
  });
});

const getReviewsByCourseId = catchAsync(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const result = await ReviewService.getReviewsByCourseId(courseId);
  
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Reviews retrieved successfully!",
      data: result,
    });
  });

// Update review
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.updateReview(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review updated successfully!",
    data: result,
  });
});

// Delete review
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.deleteReview(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Review deleted successfully!",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewsByCourseId
};
