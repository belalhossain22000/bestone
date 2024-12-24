import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import { IUser, IUserFilterRequest } from "./user.interface";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpars/paginationHelper";
import { Prisma, Student, User, UserRole, UserStatus } from "@prisma/client";
import { userSearchAbleFields } from "./user.costant";
import config from "../../../config";
import httpStatus from "http-status";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";

import { AuthServices } from "../Auth/auth.service";
import stripe from "../../../helpars/stripe";

//*! Create a new student in the database.
const createStudent = async (payload: Student & any) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.student.email },
  });

  if (isUserExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Student with this email already exists"
    );
  }
  // Hash the password
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // Generate a new referredId
  const referredId = uuidv4();

  // Check if referredId exists
  const inviter = payload.student.referredId
    ? await prisma.student.findUnique({
        where: { referredId: payload.student.referredId },
      })
    : null;

  // Define transaction logic
  const result = await prisma.$transaction(async (transaction) => {
    // Update inviter's coin balance if referredId exists
    if (inviter) {
      await transaction.student.update({
        where: { id: inviter.id },
        data: { coin: (inviter.coin as number) + 10 },
      });
    }

    let customer;
    try {
      customer = await stripe.customers.create({
        email: payload.student.email,
      });
    } catch (error: any) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, error);
    }
    if (!customer) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Failed to create student");
    }

    // Create user
    await transaction.user.create({
      data: {
        email: payload.student.email,
        password: hashedPassword,
        role: UserRole.STUDENT,
      },
    });

    // Create student
    const student = await transaction.student.create({
      data: {
        ...payload.student,
        referredId,
        coin: inviter ? 50 : 0,
        stripeCustomerId: customer.id,
      },
    });

    return student;
  });
  let token;
  if (result) {
    token = await AuthServices.loginUser({
      email: payload.student.email,
      password: payload.password,
    });
  }
  return { token };
};

//*! Create a new teacher in the database.

const createTeacher = async (req: Request) => {
  const file = req.file as any;

  let payload = JSON.parse(req.body.body);

  if (file) {
    payload.teacher.profileImage = `${config.backend_base_url}/uploads/${file.originalname}`;
  }

  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.teacher.email },
  });

  if (isUserExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher with this email already exists"
    );
  }

  if (!payload.teacher.instituteId)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Institute not selected must have to select a institute "
    );

  // hash the password
  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // create user in the database using transaction for atomicity.
  const result = await prisma.$transaction(async (transaction) => {
    await transaction.user.create({
      data: {
        email: payload.teacher.email,
        password: hashedPassword,
        role: UserRole.TEACHER,
      },
    });

    const teacher = await transaction.teacher.create({
      data: payload.teacher,
    });
    return teacher;
  });
  // let token;
  // if (result) {
  //   token = await AuthServices.loginUser({
  //     email: payload.teacher.email,
  //     password: payload.password,
  //   });
  // }
  return result;
};

//*! Create a new admin in the database.

const createAdmin = async (payload: any) => {
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.admin.email },
  });

  if (isUserExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Admin with this email already exists"
    );
  }
  // hash the password
  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // create user in the database using transaction for atomicity.
  const result = await prisma.$transaction(async (transaction) => {
    await transaction.user.create({
      data: {
        email: payload.admin.email,
        password: hashedPassword,
        role: UserRole.ADMIN,
      },
    });

    const admin = await transaction.admin.create({
      data: payload.admin,
    });
    return admin;
  });
  let token;
  if (result) {
    token = await AuthServices.loginUser({
      email: payload.admin.email,
      password: payload.password,
    });
  }
  return { token };
};

//*! Create a new institute in the database.

const createInstitute = async (req: Request) => {
  const files = req.files as any;
  let payload = JSON.parse(req.body.body);
  if (files) {
    payload.institute.profileImage = `${config.backend_base_url}/uploads/${files.image[0].originalname}`;
    payload.institute.video = `${config.backend_base_url}/uploads/${files.video[0].originalname}`;
  }

  // console.log(payload.institute);
  const isUserExist = await prisma.user.findUnique({
    where: { email: payload.institute.email },
  });

  if (isUserExist) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Institute with this email already exists"
    );
  }
  // hash the password
  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  // create user in the database using transaction for atomicity.
  const result = await prisma.$transaction(async (transaction) => {
    await transaction.user.create({
      data: {
        email: payload.institute.email,
        password: hashedPassword,
        role: UserRole.INSTITUTE,
      },
    });

    const institute = await transaction.institute.create({
      data: payload.institute,
    });
    return institute;
  });
  // let token;
  // if (result) {
  //   token = await AuthServices.loginUser({
  //     email: payload.institute.email,
  //     password: payload.password,
  //   });
  // }
  return result;
};

// reterive all users from the database also searcing anf filetering
const getUsersFromDb = async (params: any, options: IPaginationOptions) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.UserWhereInput[] = [];

  //console.log(filterData);
  if (params.searchTerm) {
    andCondions.push({
      OR: userSearchAbleFields.map((field) => ({
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

  const whereConditons: Prisma.UserWhereInput =
    andCondions.length > 0 ? { AND: andCondions } : {};

  const result = await prisma.user.findMany({
    where: whereConditons,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await prisma.user.count({
    where: whereConditons,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// update profile by user won profile uisng token or email and id
const updateProfile = async (req: Request) => {
  const files = req.files as any;
  // console.log(files);
  let payload: any = {};
  if (req.body.body) {
    payload = JSON.parse(req.body.body);
  }

  // Add profile image URL to payload if file exists
  if (files?.image) {
    payload.profileImage = `${config.backend_base_url}/uploads/${files.image[0].originalname}`;
  }
  // console.log(payload);
  if (files?.video) {
    payload.video = `${config.backend_base_url}/uploads/${files.video[0].originalname}`;
  }

  const { email, id, role } = req.user;

  // Step 1: Check if user exists
  const user = await prisma.user.findUnique({
    where: { email, id },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Step 2: Use transaction to update User and role-specific table
  const result = await prisma.$transaction(async (prisma) => {
    // Update User table email if it exists in the payload
    if (payload.email && payload.email !== user.email) {
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      // if (existingUserWithEmail) {
      //   throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");
      // }

      // Update the email in the User table
      await prisma.user.update({
        where: { id: user.id },
        data: { email: payload.email },
      });

      // Update the user's email reference
      user.email = payload.email;
    }

    // Update role-specific table
    let updatedProfile;

    switch (user.role) {
      case "STUDENT":
        updatedProfile = await prisma.student.update({
          where: { email: user.email },
          data: payload,
        });
        break;

      case "TEACHER":
        updatedProfile = await prisma.teacher.update({
          where: { email: user.email },
          data: payload,
        });
        break;

      case "INSTITUTE":
        updatedProfile = await prisma.institute.update({
          where: { email: user.email },
          data: payload,
        });
        break;

      case "ADMIN":
        updatedProfile = await prisma.admin.update({
          where: { email: user.email },
          data: payload,
        });
        break;

      default:
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user role");
    }

    return updatedProfile;
  });

  // Step 3: Return updated profile
  return {
    message: "Profile updated successfully",
    data: result,
  };
};

// update user data into database by id fir admin
const updateUserIntoDb = async (payload: IUser, id: string) => {
  const userInfo = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!userInfo)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with id: " + id);

  const result = await prisma.user.update({
    where: {
      id: userInfo.id,
    },
    data: payload,
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!result)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update user profile"
    );

  return result;
};

export const userService = {
  createStudent,
  createInstitute,
  createTeacher,
  createAdmin,
  getUsersFromDb,
  updateProfile,
  updateUserIntoDb,
};
