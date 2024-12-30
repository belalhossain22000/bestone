// Import necessary modules and configurations
import { Request } from "express";
import config from "../../../config";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma } from "@prisma/client";
import { courseSearchAbleFields } from "./course.constant";
import { uploadToDigitalOceanAWS } from "../../../helpars/fileUploadAws";

// Create a new course
const createCourse = async (req: Request) => {
  if (!req.file)
    throw new ApiError(httpStatus.NOT_FOUND, "Thumbnail image is required");

  const image = await uploadToDigitalOceanAWS(req.file);

  // const thumbUrl = `${config.backend_base_url}/uploads/${req.file?.originalname}`;
  const payload = JSON.parse(req.body.body);

  const isCourseExist = await prisma.course.findUnique({
    where: { title: payload.title },
  });

  if (isCourseExist)
    throw new ApiError(
      httpStatus.CONFLICT,
      `Course with title ${payload.title} already exists`
    );

  const isTeacherExist = await prisma.teacher.findUnique({
    where: { id: payload.teacherId },
  });

  if (!isTeacherExist)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Teacher with id ${payload.teacherId} not found`
    );

  const isCategoryExist = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!isCategoryExist)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Category with id ${payload.categoryId} not found`
    );

  const result = await prisma.course.create({
    data: { ...payload, thumbUrl: image.Location },
  });

  return result;
};

// Get all courses with optional filtering
const getAllCourses = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;
  const andCondions: Prisma.CourseWhereInput[] = [];

  if (params.searchTerm) {
    andCondions.push({
      OR: courseSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  const whereConditons: Prisma.CourseWhereInput =
    andCondions.length > 0 ? { AND: andCondions } : {};

  // Fetch courses with related data
  const courses = await prisma.course.findMany({
    where: whereConditons,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? options.sortBy === "averageRating"
          ? undefined // We'll handle rating sorting later
          : {
              [options.sortBy]: options.sortOrder,
            }
        : {
            createdAt: "desc",
          },
    include: {
      institute: true,
      Teacher: true,
      Payment: true,
      Category: true,
      InstituteType: true,
    },
  });

  // Calculate average rating and total review count for each course
  const coursesWithRatings = await Promise.all(
    courses.map(async (course) => {
      const reviewStats = await prisma.courseReview.aggregate({
        where: { courseId: course.id },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        ...course,
        averageRating: reviewStats._avg.rating || 0,
        totalReviews: reviewStats._count.rating || 0,
      };
    })
  );

  // Sort by rating if specified
  if (options.sortBy === "averageRating") {
    coursesWithRatings.sort((a, b) => {
      if (options.sortOrder === "asc") {
        return a.averageRating - b.averageRating;
      } else {
        return b.averageRating - a.averageRating;
      }
    });
  }

  // Get total count of courses
  const total = await prisma.course.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: coursesWithRatings,
  };
};

// Get course by ID
const getCourseById = async (courseId: string) => {
  if (!courseId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "courseId is required");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      institute: true,
      Teacher: true,
      // Fetch course reviews and their associated user and student data
      CourseReview: {
        include: {
          user: {
            include: {
              student: true,
            },
          },
        },
      },
    },
  });

  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  // Calculate total review count and average rating
  const totalReviews = course.CourseReview.length;
  const averageRating =
    totalReviews > 0
      ? course.CourseReview.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews
      : 0;

  // Return the course along with calculated values
  return {
    ...course,
    totalReviews,
    averageRating: parseFloat(averageRating.toFixed(1)), // Rounded to 1 decimal place
  };
};

// Update course
const updateCourse = async (req: Request) => {
  const courseId = req.params.id;

  const image = await uploadToDigitalOceanAWS(req.file!);

  // const thumbUrl = req.file
  //   ? `${config.backend_base_url}/uploads/${req.file.originalname}`
  //   : undefined;
  const thumbUrl = image?.Location!;

  const payload = req.body.body ? JSON.parse(req.body.body) : {};

  if (req.file) payload.thumbUrl = thumbUrl;

  const isCourseExist = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!isCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const result = await prisma.course.update({
    where: { id: courseId },
    data: payload,
  });

  return result;
};

// get course by institute
const getCoursesByInstitute = async (instituteId: string) => {
  const courses = await prisma.course.findMany({
    where: { instituteId },
    include: {
      Teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      CourseReview: {
        select: {
          rating: true,
        },
      },
    },
  });

  if (!courses || courses.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No courses found for this institute"
    );
  }

  // Add average rating and total reviews for each course
  const enrichedCourses = courses.map((course) => {
    const totalReviews = course.CourseReview.length;
    const avgRating =
      totalReviews > 0
        ? course.CourseReview.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    return {
      ...course,
      avgRating: parseFloat(avgRating.toFixed(2)), // Round to 2 decimal places
      totalReviews,
    };
  });

  return enrichedCourses;
};

// Get courses by teacher
const getCoursesByTeacher = async (teacherId: string) => {
  const courses = await prisma.course.findMany({
    where: { teacherId },
    include: {
      CourseReview: true, // Include reviews for each course
      institute: {
        select: {
          name: true, // Include the institute name
        },
      },
    },
  });

  if (!courses || courses.length === 0) {
    throw new Error("No courses found for this teacher.");
  }

  // Aggregate total reviews and calculate average rating
  let totalReviews = 0;
  let totalRating = 0;

  courses.forEach((course) => {
    const courseReviews = course.CourseReview;
    totalReviews += courseReviews.length; // Total number of reviews
    totalRating += courseReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    ); // Sum of all ratings
  });

  const avgRating =
    totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : 0;

  // Transform the result
  const transformedCourses = courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    duration: course.duration,
    lessons: course.lessons,
    thumbUrl: course.thumbUrl,
    reviews: course.CourseReview.length, // Total reviews for the course
    institute: course.institute?.name || "Unknown",
  }));

  return {
    teacherId,
    courses: transformedCourses,
    totalReviews,
    avgRating,
  };
};

// Recommend courses by interest
const recommendCoursesByInterest = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const student = await prisma.student.findUnique({
    where: { email: user?.email },
  });

  if (!student || !student.interest) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Student interest not found");
  }

  // Ensure student.interest is parsed correctly
  const interests =
    typeof student.interest === "string"
      ? JSON.parse(student.interest)
      : student.interest;

  if (!Array.isArray(interests)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Student interest is not valid");
  }

  // Find courses based on interests
  const matchedCourses = await prisma.course.findMany({
    where: {
      OR: interests.map((interest: string) => ({
        OR: [
          { title: { contains: interest, mode: "insensitive" } },
          { description: { contains: interest, mode: "insensitive" } },
          { whatYouWillLearn: { contains: interest, mode: "insensitive" } },
        ],
      })),
    },
    include: {
      institute: true, // Include institute data
      CourseReview: true, // Include reviews for rating calculations
    },
  });

  // Calculate total reviews and average rating for each course
  const coursesWithRatings = matchedCourses.map((course) => {
    const totalReviews = course.CourseReview.length;
    const averageRating =
      totalReviews > 0
        ? course.CourseReview.reduce((sum, review) => sum + review.rating, 0) /
          totalReviews
        : 0;

    return {
      id: course.id,
      title: course.title,
      price: course.price,
      description: course.description,
      startDate: course.startDate,
      endDate: course.endDate,
      thumbUrl: course.thumbUrl,
      institute: {
        id: course.institute.id,
        name: course.institute.name,
        profileImage: course.institute.profileImage,
      },
      averageRating: parseFloat(averageRating.toFixed(1)),
      totalReviews,
    };
  });

  // If no courses match, fetch a few random courses for fallback
  if (coursesWithRatings.length === 0) {
    const fallbackCourses = await prisma.course.findMany({
      take: 5, // Limit to 5 random courses
      include: {
        institute: true, // Include institute data
        CourseReview: true, // Include reviews for rating calculations
      },
    });

    const fallbackCoursesWithRatings = fallbackCourses.map((course) => {
      const totalReviews = course.CourseReview.length;
      const averageRating =
        totalReviews > 0
          ? course.CourseReview.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / totalReviews
          : 0;

      return {
        id: course.id,
        title: course.title,
        price: course.price,
        description: course.description,
        startDate: course.startDate,
        endDate: course.endDate,
        thumbUrl: course.thumbUrl,
        institute: {
          id: course.institute.id,
          name: course.institute.name,
          profileImage: course.institute.profileImage,
        },
        averageRating: parseFloat(averageRating.toFixed(1)),
        totalReviews,
      };
    });

    return {
      message:
        "No courses matched your interests. Here are some recommendations:",
      courses: fallbackCoursesWithRatings,
    };
  }

  // Return matched courses with ratings
  return {
    message: "Here are some courses based on your interests:",
    courses: coursesWithRatings,
  };
};

// Delete course
const deleteCourse = async (courseId: string) => {
  const isCourseExist = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!isCourseExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
  }

  const result = await prisma.course.delete({
    where: { id: courseId },
  });

  return result;
};

const getMyCourses = async (user: any) => {
  const result = await prisma.payment.findMany({
    where: {
      userEmail: user.email, // Filter payments by the user's email
    },
    include: {
      course: {
        include: {
          institute: true,
          CourseCompletion: true, // Include institute details for each course
        },
      },
    },
  });

  if (!result || result.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No courses found for this user");
  }

  // Map the result to include payment information and related course details
  const coursesWithPayments = result.map((payment) => ({
    paymentId: payment.id,
    paymentStatus: payment.status,
    paymentAmount: payment.amount,
    paymentCurrency: payment.currency,
    paymentDate: payment.createdAt,
    course: {
      id: payment.course.id,
      title: payment.course.title,
      description: payment.course.description,
      startDate: payment.course.startDate,
      endDate: payment.course.endDate,
      lessons: payment.course.lessons,
      language: payment.course.language,
      classTime: payment.course.classTime,
      courseDays: payment.course.courseDays,
      duration: payment.course.duration,
      courseHours: payment.course.courseHours,
      level: payment.course.level,
      whatYouWillLearn: payment.course.whatYouWillLearn,
      price: payment.course.price,
      thumbUrl: payment.course.thumbUrl,
      availableSeats: payment.course.availableSeats,
      certificateOffered: payment.course.certificateOffered,
      internshipSupport: payment.course.internshipSupport,
      teacherId: payment.course.teacherId,
      institute: payment.course.institute,
      createdAt: payment.course.createdAt,
      updatedAt: payment.course.updatedAt,
      courseCompletion: payment.course.CourseCompletion,
    },
  }));

  return coursesWithPayments;
};

// Export the CourseService
export const CourseService = {
  createCourse,
  getCourseById,
  getAllCourses,
  updateCourse,
  deleteCourse,
  getCoursesByInstitute,
  getCoursesByTeacher,
  recommendCoursesByInterest,
  getMyCourses,
};
