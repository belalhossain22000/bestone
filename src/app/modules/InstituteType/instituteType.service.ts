import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

// instituteType.service: Module file for the instituteType.service functionality.
const createInstituteType = async (data: { name: string }) => {
  try {
    const result = await prisma.instituteType.create({
      data,
    });
    return result;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to create institute type: ${error.message}`
    );
  }
};

const getAllInstituteTypes = async (): Promise<any[]> => {
  try {
    const instituteTypes = await prisma.instituteType.findMany();
    if (instituteTypes.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No institute types found");
    }
    return instituteTypes;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch institute types: ${error.message}`
    );
  }
};

const getInstituteTypeById = async (id: string): Promise<any> => {
  try {
    const instituteType = await prisma.instituteType.findUnique({
      where: { id },
    });
    if (!instituteType) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Institute type not found with ID: ${id}`
      );
    }
    return instituteType;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch institute type: ${error.message}`
    );
  }
};

const updateInstituteType = async (id: string, data: { name?: string }) => {
  try {
    const updatedInstituteType = await prisma.instituteType.update({
      where: { id },
      data,
    });
    if (!updatedInstituteType) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Institute type not found with ID: ${id}`
      );
    }
    return updatedInstituteType;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to update institute type: ${error.message}`
    );
  }
};

const deleteInstituteType = async (id: string): Promise<void> => {
  try {
    await prisma.instituteType.delete({
      where: { id },
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Failed to delete institute type with ID: ${id}`
    );
  }
};

const getInstituteTypeWithCourses = async (id: string): Promise<any> => {
  try {
    const instituteType = await prisma.instituteType.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!instituteType) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Institute type not found with ID: ${id}`
      );
    }
    return instituteType;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch institute type with courses: ${error.message}`
    );
  }
};

const getAllInstituteTypesWithCourses = async (): Promise<any[]> => {
    console.log("object");
  try {
    const instituteTypes = await prisma.instituteType.findMany({
      include: { course: true },
    });
    if (instituteTypes.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No institute types found");
    }
    return instituteTypes;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch institute types with courses: ${error.message}`
    );
  }
};

export const InstituteTypeService = {
  createInstituteType,
  getAllInstituteTypes,
  getInstituteTypeById,
  updateInstituteType,
  deleteInstituteType,
  getInstituteTypeWithCourses,
  getAllInstituteTypesWithCourses,
};
