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
  const { searchTerm, latitude, longitude, maxDistance, ...filterData } =
    params;
  // console.log(latitude, longitude, maxDistance);
  const andConditions: Prisma.InstituteWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: instituteSearchAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
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

  // Fetch all institutes to filter by distance
  const institutes = await prisma.institute.findMany({
    where: whereConditions,
    include: {
      user: true,
      course: {
        include: {
          CourseReview: true,
        },
      },
      Teacher: true,
    },
  });

  // Filter by distance if latitude and longitude are provided
  let filteredInstitutes = institutes;
  if (latitude && longitude && maxDistance) {
    const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

    filteredInstitutes = institutes.filter((institute) => {
      if (institute.latitude && institute.longitude) {
        const lat1 = parseFloat(latitude);
        const lon1 = parseFloat(longitude);
        const lat2 = institute.latitude;
        const lon2 = institute.longitude;

        // Haversine formula
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;

        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = EARTH_RADIUS_KM * c; // Distance in kilometers

        return distance <= parseFloat(maxDistance);
      }
      return false; // Exclude institutes without lat/long
    });
  }

  // Map institute data to extract required details
  const instituteData = filteredInstitutes.map((institute) => {
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
    const totalCourses = institute?.course?.length ?? 0;
    const totalTeachers = institute?.Teacher?.length ?? 0;

    return {
      id: institute.id,
      userid:institute.user.id,
      name: institute.name,
      email: institute.email,
      latitude: institute.latitude,
      longitude: institute.longitude,
      phoneNumbers: institute.phoneNumbers,
      profileImage: institute.profileImage,
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
      address: institute.address,
      about: institute.about,
      totalTeachers,
      totalCourses,
    };
  });

  // Sort by average rating in descending order
  const sortedInstitutes = instituteData.sort(
    (a, b) => b.averageRating - a.averageRating
  );

  // Paginate results
  const paginatedInstitutes = sortedInstitutes.slice(skip, skip + limit);

  // Get total count of institutes after location filtering
  const total = filteredInstitutes.length;

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: paginatedInstitutes,
  };
};

// Get institute by ID
// Get institute by ID
const getInstituteById = async (id: string) => {
  const institute = await prisma.institute.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          CourseReview: true,
          Payment: {
            include: {
              student: true,
            },
          },
        },
      },
    },
  });

  if (!institute) {
    throw new ApiError(httpStatus.NOT_FOUND, "Institute not found");
  }

  // Calculate total courses
  const totalCourses = institute.course.length;

  // Calculate total reviews
  const totalReviews = institute.course.reduce(
    (sum, course) => sum + course.CourseReview.length,
    0
  );

  // Calculate total students enrolled in any course under the institute
  const enrolledStudentIds = new Set<string>(); // Use a set to avoid duplicates
  institute.course.forEach((course) => {
    course.Payment.forEach((payment) => {
      enrolledStudentIds.add(payment.userEmail); // Add each studentId
    });
  });

  const totalStudents = enrolledStudentIds.size; // Get unique count

  return {
    ...institute,
    totalCourses,
    totalReviews,
    totalStudents, // Add total students to the response
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
