// instituteType.routes: Module file for the instituteType.routes functionality.
import express from 'express';
import { InstituteTypeController } from './instituteType.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Create a new institute type
router.post(
  '/',
//   auth(UserRole.ADMIN),
  InstituteTypeController.createInstituteType
);

// Get all institute types
router.get(
  '/',
//   auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
  InstituteTypeController.getAllInstituteTypes
);

// Get all institute types with courses
router.get(
    '/with-courses',
  //   auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
    InstituteTypeController.getAllInstituteTypesWithCourses
  );

// Get a specific institute type by ID
router.get(
  '/:id',
//   auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
  InstituteTypeController.getInstituteTypeById
);

// Update a specific institute type by ID
router.put(
  '/:id',
//   auth(UserRole.ADMIN),
  InstituteTypeController.updateInstituteType
);

// Delete a specific institute type by ID
router.delete(
  '/:id',
//   auth(UserRole.ADMIN),
  InstituteTypeController.deleteInstituteType
);

// Get an institute type with courses by ID
router.get(
  '/:id/courses',
//   auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT),
  InstituteTypeController.getInstituteTypeWithCourses
);



export const InstituteTypeRoutes = router;