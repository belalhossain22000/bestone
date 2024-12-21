// offeredCourse.validation: Module file for the offeredCourse.validation functionality.
import { z } from "zod";

const createOfferedCourseSchema = z.object({
  courseId: z.string().nonempty("Course ID is required"),
  offeredPercentage: z
    .number()
    .min(0)
    .max(100, "Offered percentage must be between 0 and 100"),
  startDate: z.string().nonempty("Start date is required"),
  endDate: z.string().nonempty("End date is required"),
});

const updateOfferedCourseSchema = z.object({
  courseId: z.string().optional(),
  offeredPercentage: z
    .number()
    .min(0)
    .max(100, "Offered percentage must be between 0 and 100")
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const getOfferedCourseByIdSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Offered course ID is required"),
  }),
});

const deleteOfferedCourseSchema = z.object({
  params: z.object({
    id: z.string().nonempty("Offered course ID is required"),
  }),
});

export const OfferedCourseValidation = {
  createOfferedCourseSchema,
  updateOfferedCourseSchema,
  getOfferedCourseByIdSchema,
  deleteOfferedCourseSchema,
};
