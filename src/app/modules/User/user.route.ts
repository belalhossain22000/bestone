import express from "express";
import validateRequest from "../../middlewares/validateRequest";

import { userController } from "./user.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpars/fileUploader";
import { UserValidation } from "./user.validation";

const router = express.Router();

//*! Create a new student in the database.
router.post(
  "/student",
  validateRequest(UserValidation.CreateStudentValidationSchema),
  userController.createStudent
);

//*! Create a new teacher in the database.
router.post(
  "/teacher",
  validateRequest(UserValidation.CreateTeacherValidationSchema),
  userController.createTeacher
);

//*! Create a new admin in the database.
router.post(
  "/admin",
  validateRequest(UserValidation.CreateAdminValidationSchema),
  userController.createAdmin
);

//*! Create a new Institute in the database.
router.post(
  "/institute",
  validateRequest(UserValidation.CreateInstituteValidationSchema),
  userController.createInstitute
);
// *!get all  user
router.get("/", userController.getUsers);

// *!profile user
router.put(
  "/profile",
  auth(UserRole.ADMIN, UserRole.STUDENT),
  fileUploader.uploadSingle,
  userController.updateProfile
);

// *!update  user
router.put("/:id", userController.updateUser);

export const userRoutes = router;
