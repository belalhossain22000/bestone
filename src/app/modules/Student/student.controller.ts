import { Request, Response } from "express";
import { StudentService } from "./student.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";

// Get all students
const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentService.getAllStudents();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All students fetched successfully!",
    data: result,
  });
});

// Get student by ID
const getStudentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudentService.getStudentById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student fetched successfully!",
    data: result,
  });
});


// Update a student
const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudentService.updateStudent(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student updated successfully!",
    data: result,
  });
});

// Delete a student
const deleteStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudentService.deleteStudent(id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Student deleted successfully!",
    data: result,
  });
});

export const StudentController = {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
