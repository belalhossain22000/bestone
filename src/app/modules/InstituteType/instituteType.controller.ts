// instituteType.controller: Module file for the instituteType.controller functionality.
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { InstituteTypeService } from "./instituteType.service";
import sendResponse from "../../../shared/sendResponse";

// Create a new institute type
const createInstituteType = catchAsync(async (req: Request, res: Response) => {
  const result = await InstituteTypeService.createInstituteType(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Institute type created successfully!",
    data: result,
  });
});

// Get an institute type by ID
const getInstituteTypeById = catchAsync(async (req: Request, res: Response) => {
  const result = await InstituteTypeService.getInstituteTypeById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institute type retrieved successfully!",
    data: result,
  });
});

// Get all institute types
const getAllInstituteTypes = catchAsync(async (req: Request, res: Response) => {
  const result = await InstituteTypeService.getAllInstituteTypes();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institute types retrieved successfully!",
    data: result,
  });
});

// Update an institute type by ID
const updateInstituteType = catchAsync(async (req: Request, res: Response) => {
  const result = await InstituteTypeService.updateInstituteType(
    req.params.id,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institute type updated successfully!",
    data: result,
  });
});

// Delete an institute type by ID
const deleteInstituteType = catchAsync(async (req: Request, res: Response) => {
  await InstituteTypeService.deleteInstituteType(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Institute type deleted successfully!",
    data: null,
  });
});

// Get an institute type with courses by ID
const getInstituteTypeWithCourses = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InstituteTypeService.getInstituteTypeWithCourses(
      req.params.id
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Institute type with courses retrieved successfully!",
      data: result,
    });
  }
);

// Get all institute types with courses
const getAllInstituteTypesWithCourses = catchAsync(
  async (req: Request, res: Response) => {
    const result = await InstituteTypeService.getAllInstituteTypesWithCourses();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Institute types with courses retrieved successfully!",
      data: result,
    });
  }
);

export const InstituteTypeController = {
  createInstituteType,
  getInstituteTypeById,
  getAllInstituteTypes,
  updateInstituteType,
  deleteInstituteType,
  getInstituteTypeWithCourses,
  getAllInstituteTypesWithCourses,
};
