import express from "express";
import { userRoutes } from "../modules/User/user.route";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { CategoryRoutes } from "../modules/Category/category.routes";
import { CourseRoutes } from "../modules/Course/course.routes";
import { ReviewRoutes } from "../modules/Review/review.routes";
import { TeacherRoutes } from "../modules/Teacher/teacher.routes";
import { StudentRoutes } from "../modules/Student/student.routes";
import { InstituteRoutes } from "../modules/Institute/institute.routes";
import { AdminRoutes } from "../modules/Admin/admin.routes";
import { OfferedCourseRoutes } from "../modules/OfferedCourse/offeredCourse.routes";
import { favouriteRoutes } from "../modules/favourite/favourite.route";
import { StripeRoutes } from "../modules/Stripe/stripe.routes";
import { InstituteTypeRoutes } from "../modules/InstituteType/instituteType.routes";
import { IssueRoutes } from "../modules/Issue/issue.routes";
import { CourseProgressRoutes } from "../modules/CourseProgress/courseProgress.routes";
import { RefundRoutes } from "../modules/Refund/refund.routes";

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
  {
    path: "/admins",
    route: AdminRoutes,
  },
  {
    path: "/offered-courses",
    route: OfferedCourseRoutes,
  },
  {
    path: "/favorites",
    route: favouriteRoutes,
  },
  {
    path: "/payments",
    route: StripeRoutes,
  },
  {
    path: "/instituteTypes",
    route: InstituteTypeRoutes,
  },
  {
    path: "/issues",
    route: IssueRoutes,
  },
  {
    path: "/course-progress",
    route: CourseProgressRoutes,
  },
  {
    path: "/refunds",
    route: RefundRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
