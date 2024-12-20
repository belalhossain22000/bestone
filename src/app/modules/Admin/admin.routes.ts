// admin.routes: Module file for the admin.routes functionality.
import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import * as AdminController from './admin.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';


const router = express.Router();

// Get all admins
router.get(
  '/',
//   auth(UserRole.ADMIN),
  AdminController.getAllAdmins
);

// Get an admin by ID
router.get(
  '/:id',
  auth(UserRole.ADMIN),
  AdminController.getAdminById
);

// Delete an admin by ID
router.delete(
  '/:id',
  auth(UserRole.ADMIN),
  AdminController.deleteAdmin
);

export const AdminRoutes = router;