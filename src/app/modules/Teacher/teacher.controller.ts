import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { TeacherService } from "./teacher.service";



// Get all teachers
const getTeachers = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherService.getTeachers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teachers retrieved successfully!",
    data: result,
  });
});

// Get a teacher by ID
const getTeacherById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeacherService.getTeacherById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher retrieved successfully!",
    data: result,
  });
});

// Get teacher with their courses
const getTeacherWithCourses = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await TeacherService.getTeacherWithCourses(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Teacher with courses retrieved successfully!",
      data: result,
    });
  });
  
// Update a teacher
const updateTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeacherService.updateTeacher(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher updated successfully!",
    data: result,
  });
});

// Delete a teacher
const deleteTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeacherService.deleteTeacher(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher deleted successfully!",
    data: result,
  });
});


export const TeacherController = {
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherWithCourses,
};
