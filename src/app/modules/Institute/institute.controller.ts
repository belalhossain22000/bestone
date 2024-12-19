import { Request, Response } from "express";
import { InstituteService } from "./institute.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import pick from "../../../shared/pick";
import { instituteFilterableFields } from "./institute.constant";



// Get all institutes
const getAllInstitutes = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, instituteFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await InstituteService.getAllInstitutes(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All institutes reterive successfully!",
    data: result,
  });
});

// Get institute by ID
const getInstituteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InstituteService.getInstituteById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institute fetched successfully!",
    data: result,
  });
});

// Get institute with courses
const getInstituteWithCourses = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InstituteService.getInstituteWithCourses(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institute with courses fetched successfully!",
    data: result,
  });
});

// Update an institute
const updateInstitute = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await InstituteService.updateInstitute(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institute updated successfully!",
    data: result,
  });
});

// Delete an institute
const deleteInstitute = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result=await InstituteService.deleteInstitute(id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Institute deleted successfully!",
    data:result,
  });
});

export const InstituteController = {
  getAllInstitutes,
  getInstituteById,
  getInstituteWithCourses,
  updateInstitute,
  deleteInstitute,
};
