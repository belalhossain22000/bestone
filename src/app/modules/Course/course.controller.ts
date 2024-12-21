import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { CourseService } from "./course.service";
import pick from "../../../shared/pick";
import { courseFilterableFields } from "./course.constant";

// Create a new course
const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.createCourse(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Course created successfully!",
    data: result,
  });
});

// Get a course by ID
const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getCourseById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course retrieved successfully!",
    data: result,
  });
});

// Get all courses with optional filters
const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, courseFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await CourseService.getAllCourses(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses retrieved successfully!",
    data: result,
  });
});

// Update a course by ID
const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.updateCourse(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course updated successfully!",
    data: result,
  });
});

// Get courses by institute
const getCoursesByInstitute = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getCoursesByInstitute(req.params.instituteId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses retrieved successfully!",
    data: result,
  });
});

// Get courses by teacher
const getCoursesByTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getCoursesByTeacher(req.params.teacherId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Courses retrieved successfully!",
    data: result,
  });
});
// Delete a course by ID
const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.deleteCourse(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Course deleted successfully!",
    data: result,
  });
});

// Export all controllers
export const CourseController = {
  createCourse,
  getCourseById,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getCoursesByInstitute,
  getCoursesByTeacher
};
