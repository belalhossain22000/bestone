// offeredCourse.routes: Module file for the offeredCourse.routes functionality.
import express from "express";
import { OfferedCourseController } from "./offeredCourse.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import validateRequest from "../../middlewares/validateRequest";
import { OfferedCourseValidation } from "./offeredCourse.validation";

const router = express.Router();

// Create a new offered course
router.post(
  "/",
  validateRequest(OfferedCourseValidation.createOfferedCourseSchema),
  //   auth(UserRole.ADMIN),
  OfferedCourseController.createOfferedCourse
);

// Get all offered courses
router.get(
  "/",
  //   auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
  OfferedCourseController.getAllOfferedCourses
);

// Get a specific offered course by ID
router.get(
  "/:id",
  //   auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
  OfferedCourseController.getOfferedCourseById
);

// Update a specific offered course by ID
router.put(
  "/:id",
  //   auth(UserRole.ADMIN),
  OfferedCourseController.updateOfferedCourse
);

// Delete a specific offered course by ID
router.delete(
  "/:id",
  //   auth(UserRole.ADMIN),
  OfferedCourseController.deleteOfferedCourse
);

export const OfferedCourseRoutes = router;
