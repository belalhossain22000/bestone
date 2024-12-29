// courseProgress.controller: Module file for the courseProgress.controller functionality.
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CourseProgressService } from './courseProgress.service';


// Create course progress
const createCourseProgress = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseProgressService.createCourseProgress(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course progress created successfully!",
    data: result,
  });
});

// Update course progress
const updateCourseProgress = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseProgressService.updateCourseProgress(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course progress updated successfully!",
    data: result,
  });
});

export const CourseProgressController = {
  createCourseProgress,
  updateCourseProgress,
};