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
  auth(UserRole.ADMIN, UserRole.INSTITUTE, UserRole.SUPER_ADMIN),
  fileUploader.uploadSingle,
  // validateRequest(UserValidation.CreateTeacherValidationSchema),
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
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.uploadInstituteFile,
  // validateRequest(UserValidation.CreateInstituteValidationSchema),
  userController.createInstitute
);
// *!get all  user
router.get("/", userController.getUsers);

// *!profile user
router.put(
  "/profile",
  auth(),
  fileUploader.uploadInstituteFile,
  userController.updateProfile
);

// *!update  user
router.put("/:id", auth(UserRole.ADMIN,UserRole.SUPER_ADMIN,UserRole.INSTITUTE),fileUploader.uploadInstituteFile, userController.updateUser);

router.delete("/:id", userController.deleteUser);

export const userRoutes = router;
