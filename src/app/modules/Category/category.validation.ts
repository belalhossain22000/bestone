// category.validation: Module file for the category.validation functionality.
import { z } from "zod";

export const CategoryValidationSchema = z.object({
  name: z.string().min(1, "Category name is required"),
});


