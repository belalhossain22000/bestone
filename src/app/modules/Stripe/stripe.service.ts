import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../helpars/stripe";
import prisma from "../../../shared/prisma";

// stripe.service: Module file for the stripe.service functionality.
// stripe.service: Module file for the stripe.service functionality.

const createPaymentIntent = async (payload: any, user: any) => {
  const { amount, courseId, paymentMethodId } = payload;

  if (!amount || !courseId || !paymentMethodId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required parameters");
  }

  try {
    // Find the student and ensure they have a Stripe customer ID
    const student = await prisma.student.findUnique({
      where: { email: user.email },
    });

    if (!student) {
      throw new ApiError(httpStatus.NOT_FOUND, "Student not found");
    }

    if (!student.stripeCustomerId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Student does not have a Stripe customer ID. Please register payment details."
      );
    }

    // Check if the course exists and has available seats
    const isCourseExist = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!isCourseExist) {
      throw new ApiError(httpStatus.NOT_FOUND, "Course not found");
    }

    if (isCourseExist.availableSeats === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No seats available for this course"
      );
    }

    // Attach the payment method to the Stripe customer (if not already attached)
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: student.stripeCustomerId,
    });

    // Create a Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert amount to cents
      currency: "usd", // Use constants for currencies
      customer: student.stripeCustomerId,
      payment_method: paymentMethod.id,
      description: `Payment for course: ${isCourseExist.title || courseId}`,
      confirm: true,
      off_session: true, // For automatic payments
    });

    // Use Prisma transaction for database consistency
    await prisma.$transaction([
      prisma.payment.create({
        data: {
          studentId: student.id,
          courseId,
          amount,
          currency: "USD",
          status: "SUCCESS",
          paymentIntentId: paymentIntent.id,
        },
      }),
      prisma.course.update({
        where: { id: courseId },
        data: {
          availableSeats: isCourseExist.availableSeats - 1,
        },
      }),
    ]);

    // Return the client secret for the payment
    return { clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    if (error.type === "StripeCardError") {
      throw new ApiError(httpStatus.BAD_REQUEST, error.message);
    }
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Payment processing failed"
    );
  }
};

const getPaymentMethodList = async (user: any) => {
  console.log(user);
  const student = await prisma.student.findUnique({
    where: {
      email: user.email,
    },
  });
  if (!student?.stripeCustomerId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Student does not have a Stripe customer ID. Please register payment details."
    );
  }

  const studentPaymentMethodList = await stripe.paymentMethods.list({
    customer: student.stripeCustomerId,
    type: "card",
  });

  if (!studentPaymentMethodList) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to fetch payment methods"
    );
  }

  return studentPaymentMethodList;
};

// Get payment history for a student
const getPaymentHistory = async (user: any) => {
  const student = await prisma.student.findUnique({
    where: { email: user.email },
  });

  if (!student || !student.stripeCustomerId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Student or Stripe customer not found"
    );
  }

  const paymentHistory = await prisma.payment.findMany({
    where: {
      studentId: student.id,
    },
  });

  if (!paymentHistory) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to fetch payment history"
    );
  }

  return paymentHistory;
};

// Get single payment details
const getPaymentDetails = async (paymentId: string, user: any) => {
  try {
    const student = await prisma.student.findUnique({
      where: { email: user.email },
    });

    const paymentDetails = await prisma.payment.findMany({
      where: {
        id: paymentId,
      },
      include: {
        student: true,
        course: {
          include: {
            institute: true,
            Teacher: true,
          },
        },
      },
    });

    if (!paymentDetails) {
      throw new ApiError(httpStatus.NOT_FOUND, "Payment not found");
    }
    if (!student || !student.stripeCustomerId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Student does not have a Stripe customer ID."
      );
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: student.stripeCustomerId,
      type: "card",
    });
    if (!paymentMethods) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to fetch payment methods"
      );
    }

    const cardDetails = paymentMethods.data.map((method) => ({
      last4: method.card?.last4,
      brand: method.card?.brand,
    }));

    return {
      paymentDetails,
      cardDetails,
    };
  } catch (error) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to fetch payment details"
    );
  }
};

export const stripeService = {
  createPaymentIntent,
  getPaymentMethodList,
  getPaymentHistory,
  getPaymentDetails,
};
