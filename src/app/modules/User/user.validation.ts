import { z } from "zod";

const CreateStudentValidationSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
  student: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"), // Ensure email is provided and is valid

    name: z.string().min(1, "Name is required"), // Ensure name is non-empty
  }),
});

const CreateTeacherValidationSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
  teacher: z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
  }),
});

const CreateInstituteValidationSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
  institute: z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
  }),
});
const CreateAdminValidationSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
  admin: z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .email("Invalid email address")
      .nonempty("Email is required"),
  }),
});

const UserLoginValidationSchema = z.object({
  email: z.string().email().nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .nonempty("Password is required"),
});

const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  promoCode: z.string().optional(),
  profession: z.string().optional(),
});

export const UserValidation = {
  CreateStudentValidationSchema,
  CreateAdminValidationSchema, 
  CreateTeacherValidationSchema,
  CreateInstituteValidationSchema,
  UserLoginValidationSchema,
  userUpdateSchema,
};
