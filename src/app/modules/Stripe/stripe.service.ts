import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../helpars/stripe";
import prisma from "../../../shared/prisma";

// stripe.service: Module file for the stripe.service functionality.
const createPaymentIntent = async (payload: any) => {
  const { studentId, amount, courseId } = payload;

  try {
    // Find the student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });
    if (!student || !student.stripeCustomerId) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Student not found or no Stripe customer ID"
      );
    }

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      customer: student.stripeCustomerId,
    });

    // Save Payment record
    await prisma.payment.create({
      data: {
        studentId,
        courseId,
        amount,
        currency: "USD",
        status: "PENDING",
        paymentIntentId: paymentIntent.id,
      },
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

export const stripeService = {
  createPaymentIntent,
};
