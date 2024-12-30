// refund.service: Module file for the refund.service functionality.
import { PrismaClient, RefundStatus } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import stripe from "../../../helpars/stripe";

const prisma = new PrismaClient();

// Create a new refund
const createRefund = async (data: {
  paymentId: string;
  reason?: string;
  message?: string;
}) => {
  try {
    const isPaymentExists = await prisma.payment.findUnique({
      where: {
        id: data.paymentId,
      },
    });

    if (!isPaymentExists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Payment not found with ID: ${data.paymentId}`
      );
    }

    const result = await prisma.refund.create({
      data,
    });
    return result;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Failed to create refund: ${error.message}`
    );
  }
};

// Get all refunds
const getAllRefunds = async (): Promise<any[]> => {
  try {
    const refunds = await prisma.refund.findMany({
      include: { payment: true },
    });
    if (refunds.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, "No refunds found");
    }
    return refunds;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch refunds: ${error.message}`
    );
  }
};

// Get a refund by ID
const getRefundById = async (id: string): Promise<any> => {
  try {
    const refund = await prisma.refund.findUnique({
      where: { id },
      include: { payment: true },
    });
    if (!refund) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Refund not found with ID: ${id}`
      );
    }
    return refund;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to fetch refund: ${error.message}`
    );
  }
};

// Update a refund by ID
const updateRefund = async (id: string, payload: { status: RefundStatus }) => {
  console.log(id, payload);
  try {
    const isRefundExist = await prisma.refund.findUnique({
      where: {
        id: id,
      },
    });

    if (!isRefundExist) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `refund not found with ID: ${id}`
      );
    }

    const updatedRefund = await prisma.refund.update({
      where: { id: id },
      data: {
        status: payload?.status || "PENDING",
      },
    });

    if (!updatedRefund) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        `Refund not found with ID: ${id}`
      );
    }

    return updatedRefund;
  } catch (error: any) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Failed to update refund: ${error.message}`
    );
  }
};

// Delete a refund by ID
const deleteRefund = async (id: string): Promise<void> => {
  try {
    await prisma.refund.delete({
      where: { id },
    });
  } catch (error) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Failed to delete refund with ID: ${id}`
    );
  }
};

// Refund amount to customer in the stripe
const refundPaymentToCustomer = async (payload: {
  paymentIntentId: string;
  refundId: string;
}) => {

  try {
    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Refund the payment intent
      const refund = await stripe.refunds.create({
        payment_intent: payload.paymentIntentId,
      });

      // Update the refund status in the database
      const updatedRefund = await prisma.refund.update({
        where: { id: payload.refundId },
        data: { status: "APPROVED" },
      });

      return updatedRefund;
    });

    return result;
  } catch (error: any) {
    // Update the refund status to REJECTED in case of an error
    await prisma.refund.update({
      where: { id: payload.refundId },
      data: { status: "REJECTED" },
    });

    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

export const RefundService = {
  createRefund,
  getAllRefunds,
  getRefundById,
  updateRefund,
  deleteRefund,
  refundPaymentToCustomer,
};
