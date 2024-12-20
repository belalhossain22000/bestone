// admin.controller: Module file for the admin.controller functionality.
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AdminService } from "./admin.service";
import pick from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";

// Get all admins
const getAllAdmins = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, adminFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await AdminService.getAllAdmins(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admins retrieved successfully!",
    data: result,
  });
});

// Get an admin by ID
const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAdminById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin retrieved successfully!",
    data: result,
  });
});



// Delete an admin by ID
const deleteAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.deleteAdmin(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Admin deleted successfully!",
    data: result,
  });
});

export { getAllAdmins, getAdminById, deleteAdmin };
