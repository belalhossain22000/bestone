// teacher.routes: Module file for the teacher.routes functionality.
import express from "express";
import { TeacherController } from "./teacher.controller";

const router = express.Router();

// Route to get all teachers
router.get("/", TeacherController.getTeachers);

// Route to get a specific teacher by ID
router.get("/:id", TeacherController.getTeacherById);

// Route to update a specific teacher by ID
router.patch("/:id", TeacherController.updateTeacher);

// Route to delete a specific teacher by ID
router.delete("/:id", TeacherController.deleteTeacher);

// Route to get a specific teacher along with their courses
router.get("/:id/courses", TeacherController.getTeacherWithCourses);

export const TeacherRoutes = router;
