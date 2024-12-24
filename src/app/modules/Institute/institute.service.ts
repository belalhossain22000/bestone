import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { instituteSearchAbleFields } from "./institute.constant";
import { Prisma } from "@prisma/client";

// Get all institutes
const getAllInstitutes = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andConditions: Prisma.InstituteWhereInput[] = [];

  if (params.searchTerm) {
    andConditions.push({
      OR: instituteSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditions: Prisma.InstituteWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  // Fetch institutes along with their courses and reviews
  const institutes = await prisma.institute.findMany({
    where: whereConditions,
    skip,
    take: limit,
    include: {
      course: {
        include: {
          CourseReview: true, // Include course reviews for calculating rating and total reviews
        },
      },
    },
  });

  // Map institute data to extract required details
  const instituteData = institutes.map((institute) => {
    // Calculate total reviews and average rating
    const allReviews = institute.course.flatMap(
      (course) => course.CourseReview
    );
    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? allReviews.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    return {
      id: institute.id,
      name: institute.name,
      profileImage: institute.profileImage,
      averageRating: parseFloat(averageRating.toFixed(1)), // Average rating
      totalReviews, // Total number of reviews (rating count)
      address: institute.address,
      about: institute.about,
    };
  });

  // Sort by average rating in descending order
  const sortedInstitutes = instituteData.sort(
    (a, b) => b.averageRating - a.averageRating
  );

  // Get total count of institutes
  const total = await prisma.institute.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: sortedInstitutes,
  };
};

// Get institute by ID
const getInstituteById = async (id: string) => {
  const institute = await prisma.institute.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          CourseReview: true, // Include reviews for each course
        },
      },
    },
  });

  if (!institute) {
    throw new ApiError(httpStatus.NOT_FOUND, "Institute not found");
  }

  // Calculate total courses and total reviews
  const totalCourses = institute.course.length;

  const totalReviews = institute.course.reduce(
    (sum, course) => sum + course.CourseReview.length,
    0
  );

  return {
    ...institute,
    totalCourses,
    totalReviews,
  };
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
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Institute not found with courses"
    );
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
