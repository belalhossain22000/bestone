// issue.routes: Module file for the issue.routes functionality.
import express from "express";
import { IssueController } from "./issue.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploader";

const router = express.Router();

// Create a new issue
router.post(
  "/",
  auth(),
  fileUploader.uploadSingle,
  IssueController.createIssue
);

// Get all issues specific user
router.get("/my-issue", auth(), IssueController.getUserIssues);
// Get all issues
router.get(
  "/",
  //   auth(UserRole.ADMIN, UserRole.USER),
  IssueController.getAllIssues
);

// Get a specific issue by ID
router.get(
  "/:id",
  //   auth(UserRole.ADMIN, UserRole.USER),
  IssueController.getIssueById
);

// Update a specific issue by ID
router.put(
  "/:id",
  //   auth(UserRole.USER),

  IssueController.updateIssue
);

// Delete a specific issue by ID
router.delete(
  "/:id",
  //   auth(UserRole.USER),

  IssueController.deleteIssue
);

export const IssueRoutes = router;
