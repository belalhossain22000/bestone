import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";


// Get all institutes
const getAllInstitutes = async () => {
  const institutes = await prisma.institute.findMany();
  return institutes;
};

// Get institute by ID
const getInstituteById = async (id: string) => {
  const institute = await prisma.institute.findUnique({
    where: { id },
  });
  if (!institute) {
    throw new ApiError(httpStatus.NOT_FOUND, "Institute not found");
  }
  return institute;
};

// Get institute with associated courses
const getInstituteWithCourses = async (id: string) => {
  const instituteWithCourses = await prisma.institute.findUnique({
    where: { id },
    include: {
      course: true, 
    },
  });
  if (!instituteWithCourses) {
    throw new ApiError(httpStatus.NOT_FOUND, "Institute not found with courses");
  }
  return instituteWithCourses;
};

// Update an institute by ID
const updateInstitute = async (id: string, data: any) => {
  const institute = await prisma.institute.update({
    where: { id },
    data,
  });
  return institute;
};

// Delete an institute by ID
const deleteInstitute = async (id: string) => {
  await prisma.institute.delete({
    where: { id },
  });
};

export const InstituteService = {
  getAllInstitutes,
  getInstituteById,
  getInstituteWithCourses,
  updateInstitute,
  deleteInstitute,
};
