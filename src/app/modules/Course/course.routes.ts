// course.routes: Module file for the course.routes functionality.
import express from "express";
import { CourseController } from "./course.controller";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";


const router = express.Router();

// Create a new course (with file upload middleware)
router.post("/", fileUploader.uploadSingle, CourseController.createCourse);

// Get all courses (with optional filters via query parameters)
router.get("/", CourseController.getAllCourses);
// Recommend courses by interest
router.get(
  "/recommendations",
  auth(),
  CourseController.recommendCoursesByInterest
);
// Get a specific course by ID
router.get("/:id", CourseController.getCourseById);
// Get courses by institute
router.get(
  "/institute/:instituteId",
  // auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
  CourseController.getCoursesByInstitute
);

// Get courses by teacher
router.get(
"/teacher/:teacherId",
// auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
CourseController.getCoursesByTeacher
);

// Update a specific course by ID (with file upload middleware)
router.patch("/:id", fileUploader.uploadSingle, CourseController.updateCourse);

// Delete a specific course by ID
router.delete("/:id", CourseController.deleteCourse);

export const CourseRoutes = router;
