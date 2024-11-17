import express from "express";
import { InstituteController } from "./institute.controller";

const router = express.Router();

// Get all institutes
router.get("/", InstituteController.getAllInstitutes);

// Get institute by ID
router.get("/:id", InstituteController.getInstituteById);

// Get institute with courses by ID
router.get("/:id/courses", InstituteController.getInstituteWithCourses);

// Update an institute by ID
router.put("/:id", InstituteController.updateInstitute);

// Delete an institute by ID
router.delete("/:id", InstituteController.deleteInstitute);

export const InstituteRoutes = router;
