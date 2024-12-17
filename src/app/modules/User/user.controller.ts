import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { userService } from "./user.services";
import { Request, Response } from "express";
import pick from "../../../shared/pick";
import { userFilterableFields } from "./user.costant";

const createStudent = catchAsync(async (req: Request, res: Response) => {

  const result = await userService.createStudent(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Student Registered successfully!",
    data: result,
  });
});

const createTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createTeacher(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Teacher Registered successfully!",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createAdmin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin Registered successfully!",
    data: result,
  });
});

const createInstitute = catchAsync(async (req: Request, res: Response) => {
  const result = await userService.createInstitute(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Institute Registered successfully!",
    data: result,
  });
});

// get all user form db
const getUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await userService.getUsersFromDb(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieve successfully!",
    data: result,
  });
});

// get all user form db
const updateProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {

    const result = await userService.updateProfile(req);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Profile updated successfully!",
      data: result,
    });
  }
);

// *! update user role and account status
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await userService.updateUserIntoDb(req.body, id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

export const userController = {
  createStudent,
  createTeacher,
  createInstitute,
  createAdmin,
  getUsers,
  updateProfile,
  updateUser,
};
