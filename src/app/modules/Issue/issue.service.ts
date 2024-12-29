// issue.service: Module file for the issue.service functionality.
import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { Request } from "express";
import { uploadToDigitalOceanAWS } from "../../../helpars/fileUploadAws";

// Create a new issue
const createIssue = async (req: Request) => {
  const file = req.file as any;
  let payload: any = {};
  if (req.body.body) {
    payload = JSON.parse(req.body.body);
  }

  // Add profile image URL to payload if file exists
  if (file) {
    payload.image = (await uploadToDigitalOceanAWS(file)).Location;
  }

  if (file && !payload.title) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payload is empty");
  }
  //   console.log(payload);
  try {
    const result = await prisma.issue.create({
      data: { ...payload, userId: req.user.id },
    });
    return result;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to create issue: ${error.message}`
    );
  }
};

// Get all issues
const getAllIssues = async (): Promise<any[]> => {
  try {
    const issues = await prisma.issue.findMany({
      include: {
        user: {
          include: {
            student: true,
            teacher: true,
            institute: true,
          },
        },
      },
    });
    if (issues.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No issues found");
    }
    return issues;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch issues: ${error.message}`
    );
  }
};

// Get an issue by ID
const getIssueById = async (id: string): Promise<any> => {
  try {
    const issue = await prisma.issue.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!issue) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Issue not found with ID: ${id}`
      );
    }
    return issue;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch issue: ${error.message}`
    );
  }
};

// Update an issue by ID
const updateIssue = async (id: string, payload: any) => {
  try {
    const updatedIssue = await prisma.issue.update({
      where: { id },
      data: { status: payload.status },
    });
    if (!updatedIssue) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Issue not found with ID: ${id}`
      );
    }
    return updatedIssue;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to update issue: ${error.message}`
    );
  }
};

// Delete an issue by ID
const deleteIssue = async (id: string): Promise<void> => {
  const isIssueExist = await prisma.issue.findUnique({
    where: { id },
  });
  if (!isIssueExist) {
    throw new ApiError(httpStatus.NOT_FOUND, `Issue not found with ID: ${id}`);
  }
  try {
    await prisma.issue.delete({
      where: { id },
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Failed to delete issue with ID: ${id}`
    );
  }
};

// get issue by user
const getIssueByUser = async (userId: string): Promise<any[]> => {
  try {
    const issues = await prisma.issue.findMany({
      where: { userId },
    });
    // if (issues.length === 0) {
    //   throw new ApiError(httpStatus.NOT_FOUND, "No issues found");
    // }
    return issues;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch issues: ${error.message}`
    );
  }
};

export const IssueService = {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
  getIssueByUser,
};
