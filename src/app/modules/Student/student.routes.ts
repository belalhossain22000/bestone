import express from "express";
import { StudentController } from "./student.controller";

const router = express.Router();

// Route to get all students
router.get("/", StudentController.getAllStudents);

// Route to get a student by ID
router.get("/:id", StudentController.getStudentById);



// Route to update a student by ID
router.put("/:id", StudentController.updateStudent);

// Route to delete a student by ID
router.delete("/:id", StudentController.deleteStudent);

export const StudentRoutes = router;
