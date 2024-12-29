// courseProgress.routes: Module file for the courseProgress.routes functionality.
import express from 'express';
import { CourseProgressController } from './courseProgress.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Create course progress
router.post(
  '/',
  auth(),
  CourseProgressController.createCourseProgress
);

// Update course progress
router.put(
  '/:id',
  auth(),
  CourseProgressController.updateCourseProgress
);

export const CourseProgressRoutes = router;