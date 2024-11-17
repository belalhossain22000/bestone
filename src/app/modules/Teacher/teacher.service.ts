import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";

const getTeachers = async () => {
  const teachers = await prisma.teacher.findMany();
  if (!teachers.length) {
    throw new ApiError(httpStatus.NOT_FOUND, "No teachers found");
  }
  return teachers;
};

const getTeacherById = async (id: string) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id },
  });
  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
  }
  return teacher;
};

const getTeacherWithCourses = async (id: string) => {
  const teacherWithCourses = await prisma.teacher.findUnique({
    where: { id },
    include: {
      course: true,
    },
  });

  if (!teacherWithCourses) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher or courses not found");
  }
  return teacherWithCourses;
};

const updateTeacher = async (id: string, payload: any) => {
  const result = await prisma.teacher.update({
    where: { id },
    data: payload,
  });
  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update teacher"
    );
  }
  return result;
};

const deleteTeacher = async (id: string) => {
  const result = await prisma.teacher.delete({
    where: { id },
  });
  if (!result) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to delete teacher"
    );
  }
  return result;
};

export const TeacherService = {
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherWithCourses,
};
