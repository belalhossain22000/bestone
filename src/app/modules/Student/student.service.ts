import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";


// Get all students
const getAllStudents = async () => {
  const result = await prisma.student.findMany();

  if (!result || result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No students found");
  }
  return result;
};

// Get a student by ID
const getStudentById = async (id: string) => {
  const result = await prisma.student.findUnique({
    where: { id },
  });

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
  }
  return result;
};

// Update a student's information
const updateStudent = async (id: string, payload: any) => {
  const result = await prisma.student.update({
    where: { id },
    data: payload,
  });

  if (!result) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update student");
  }
  return result;
};

// Delete a student by ID
const deleteStudent = async (id: string) => {
  const result = await prisma.student.delete({
    where: { id },
  });

  if (!result) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to delete student");
  }
  return result;
};

export const StudentService = {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
