import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import emailSender from "./emailSender";
import { PrismaClient, UserStatus } from "@prisma/client";
import httpStatus from "http-status";

// user login
const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData?.email) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    );
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return { token: accessToken };
};

const getMyProfile = async (user: any) => {
  // console.log(decodedToken);
  const profile = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      admin: true,
      institute: true,
      student: true,
      teacher: true,
    },
  });

  if (!profile) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found.");
  }

  return profile;
};

// change password

const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string
) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: decodedToken.id,
    },
    data: {
      password: hashedPassword,
    },
  });
  return { message: "Password changed successfully" };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  // Generate OTP (4-digit code)
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Save OTP to the database with expiry time (e.g., 10 minutes)
  await prisma.user.update({
    where: { email: userData.email },
    data: { otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  });

  // Design the OTP email
  await emailSender(
    "Your OTP for Password Reset",
    userData.email,
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #007BFF;">Reset Your Password</h2>
      
      <p>Hi <strong>${userData.email}</strong>,</p>
      
      <p>We received a request to reset your password. Use the OTP below to proceed:</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; border: 2px solid #007BFF; border-radius: 5px; display: inline-block; color: #007BFF;">
          ${otp}
        </span>
      </div>
      
      <p style="color: #777;">This OTP will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support for assistance.</p>
      
      <p>Thank you,<br><strong>Best One</strong></p>
    </div>
    `
  );

  return { message: "OTP sent to your email successfully.", otp };
};

const verifyOtp = async (payload: { email: string; otp: string }) => {
  // Fetch user data by email
  const userData = await prisma.user.findUniqueOrThrow({
    where: { email: payload.email },
  });

  // Check if OTP exists and is not expired
  if (!userData.otp || !userData.otpExpiresAt) {
    throw new Error("OTP not found or has expired. Please request a new OTP.");
  }

  // Verify the OTP and its expiration
  const currentTime = new Date();
  if (userData.otp !== payload.otp || currentTime > userData.otpExpiresAt) {
    throw new Error("Invalid or expired OTP. Please try again.");
  }

  // OTP is valid; allow the user to proceed
  // Optionally clear OTP and expiration after verification
  await prisma.user.update({
    where: { email: payload.email },
    data: { otp: null, otpExpiresAt: null },
  });
  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );
  return {
    message: "OTP verified successfully. Proceed to reset your password.",
    token: accessToken,
  };
};

// reset password
const resetPassword = async (token: string, payload: { password: string }) => {
  console.log(token, payload);
  const isValidToken = jwtHelpers.verifyToken(
    token,
    config.jwt.jwt_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: isValidToken.id,
    },
  });

  // hash password
  const password = await bcrypt.hash(payload.password, 12);

  // update into database
  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password,
    },
  });
  return { message: "Password reset successfully" };
};

export const AuthServices = {
  loginUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyOtp,
};
