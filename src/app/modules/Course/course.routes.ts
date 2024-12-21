// course.routes: Module file for the course.routes functionality.
import express from "express";
import { CourseController } from "./course.controller";
import { fileUploader } from "../../../helpars/fileUploader";


const router = express.Router();

// Create a new course (with file upload middleware)
router.post("/", fileUploader.uploadSingle, CourseController.createCourse);

// Get all courses (with optional filters via query parameters)
router.get("/", CourseController.getAllCourses);

// Get a specific course by ID
router.get("/:id", CourseController.getCourseById);

// Update a specific course by ID (with file upload middleware)
router.patch("/:id", fileUploader.uploadSingle, CourseController.updateCourse);

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

// Delete a specific course by ID
router.delete("/:id", CourseController.deleteCourse);

export const CourseRoutes = router;
