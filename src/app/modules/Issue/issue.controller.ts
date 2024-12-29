// issue.controller: Module file for the issue.controller functionality.
import { Request, Response } from "express";
import httpStatus from "http-status";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { IssueService } from "./issue.service";

// Create a new issue
const createIssue = catchAsync(async (req: Request, res: Response) => {
  const result = await IssueService.createIssue(req);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Issue created successfully!",
    data: result,
  });
});

// Get all issues
const getAllIssues = catchAsync(async (req: Request, res: Response) => {
  const result = await IssueService.getAllIssues();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Issues retrieved successfully!",
    data: result,
  });
});

// Get an issue by ID
const getIssueById = catchAsync(async (req: Request, res: Response) => {
  const result = await IssueService.getIssueById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Issue retrieved successfully!",
    data: result,
  });
});

// Update an issue by ID
const updateIssue = catchAsync(async (req: Request, res: Response) => {
  const result = await IssueService.updateIssue(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Issue updated successfully!",
    data: result,
  });
});

// Delete an issue by ID
const deleteIssue = catchAsync(async (req: Request, res: Response) => {
  const result = await IssueService.deleteIssue(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Issue deleted successfully!",
    data: result,
  });
});

// get issue by user
const getUserIssues = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  const result = await IssueService.getIssueByUser(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Issues retrieved successfully!",
    data: result,
  });
});

export const IssueController = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getUserIssues
};
