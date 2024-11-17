import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { CategoryRoutes } from "../modules/Category/category.routes";
import { CourseRoutes } from "../modules/Course/course.routes";
import { ReviewRoutes } from "../modules/Review/review.routes";
import { TeacherRoutes } from "../modules/Teacher/teacher.routes";
import { StudentRoutes } from "../modules/Student/student.routes";
import { InstituteRoutes } from "../modules/Institute/institute.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/course",
    route: CourseRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/teachers",
    route: TeacherRoutes,
  },
  {
    path: "/students",
    route: StudentRoutes,
  },
  {
    path: "/institutes",
    route: InstituteRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
