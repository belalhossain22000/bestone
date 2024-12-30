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
import { uploadToDigitalOceanAWS } from "../../../helpars/fileUploadAws";

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
    // payload.teacher.profileImage = `${config.backend_base_url}/uploads/${file.originalname}`;
    payload.teacher.profileImage = (
      await uploadToDigitalOceanAWS(req.file!)
    ).Location;
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
  // console.log(payload);

  if (files) {
    payload.institute.profileImage = (
      await uploadToDigitalOceanAWS(files.image[0])
    ).Location;
    payload.institute.video = (
      await uploadToDigitalOceanAWS(files.video[0])
    ).Location;
  }
  // console.log(payload);
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
    payload.profileImage = (
      await uploadToDigitalOceanAWS(files.image[0])
    ).Location;
  }
  // console.log(payload);
  if (files?.video) {
    payload.video = (await uploadToDigitalOceanAWS(files.video[0])).Location;
  }

  if (!payload || Object.keys(payload).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payload is empty");
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
const updateUserIntoDb = async (req:Request, id: string) => {
  const files = req.files as any;
  // console.log(files);
  let payload: any = {};
  if (req.body.body) {
    payload = JSON.parse(req.body.body);
  }

  // Add profile image URL to payload if file exists
  if (files?.image) {
    payload.profileImage = (
      await uploadToDigitalOceanAWS(files.image[0])
    ).Location;
  }
  // console.log(payload);
  if (files?.video) {
    payload.video = (await uploadToDigitalOceanAWS(files.video[0])).Location;
  }

  if (!payload || Object.keys(payload).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payload is empty");
  }

  

  // Step 1: Check if user exists
  const user = await prisma.user.findUnique({
    where: {  id },
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
    message: "User updated successfully",
    data: result,
  };
};

// Delete user from database

const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Start the transaction
    const result = await prisma.$transaction(async (tx) => {
      // Find the user by ID
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          admin: true, // Include related Admin to check the relation
          teacher: true, // Include Teacher relation
          institute: true, // Include Institute relation
          student: true, // Include Student relation
        },
      });

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      // Delete related models based on role or relations
      if (user.admin) {
        const result = await tx.admin.delete({
          where: { email: user.email },
        });
      }

      if (user.teacher.length > 0) {
        const result = await tx.teacher.deleteMany({
          where: { email: user.email },
        });
      }

      if (user.institute.length > 0) {
        const result = await tx.institute.deleteMany({
          where: { email: user.email },
        });
      }

      if (user.student.length > 0) {
        const result = await tx.student.deleteMany({
          where: { email: user.email },
        });
      }

      // Delete associated data (e.g., Favorites, Payments, Course Reviews)
      await tx.favorite.deleteMany({
        where: { userId: userId },
      });

      await tx.payment.deleteMany({
        where: { userEmail: user.email },
      });

      await tx.courseReview.deleteMany({
        where: { userId: userId },
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId },
      });
    });
    return result;
  } catch (error: any) {
    console.log(error);
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Transaction failed. Rolled back changes: ${error.message}`
    );
  }
};

export const userService = {
  createStudent,
  createInstitute,
  createTeacher,
  createAdmin,
  getUsersFromDb,
  updateProfile,
  updateUserIntoDb,
  deleteUser,
};
