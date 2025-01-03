// offeredCourse.controller: Module file for the offeredCourse.controller functionality.
import { Request, Response } from 'express';
import httpStatus from 'http-status';

import * as OfferedCourseService from './offeredCourse.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';

// Create a new offered course
const createOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.createOfferedCourse(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Offered course created successfully!",
    data: result,
  });
});

// Get an offered course by ID
const getOfferedCourseById = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.getOfferedCourseById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offered course retrieved successfully!",
    data: result,
  });
});

// Get all offered courses
const getAllOfferedCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.getAllOfferedCourses();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offered courses retrieved successfully!",
    data: result,
  });
});

// Update an offered course by ID
const updateOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await OfferedCourseService.updateOfferedCourse(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offered course updated successfully!",
    data: result,
  });
});

// Delete an offered course by ID
const deleteOfferedCourse = catchAsync(async (req: Request, res: Response) => {
  const result=await OfferedCourseService.deleteOfferedCourse(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Offered course deleted successfully!",
    data: result,
  });
});

export const OfferedCourseController = {
  createOfferedCourse,
  getOfferedCourseById,
  getAllOfferedCourses,
  updateOfferedCourse,
  deleteOfferedCourse,
};