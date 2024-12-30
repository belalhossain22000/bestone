// refund.controller: Module file for the refund.controller functionality.
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { RefundService } from "./refund.service";

// Create a new refund
const createRefund = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundService.createRefund(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Refund created successfully!",
    data: result,
  });
});

// Get all refunds
const getAllRefunds = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundService.getAllRefunds();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refunds retrieved successfully!",
    data: result,
  });
});

// Get a refund by ID
const getRefundById = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundService.getRefundById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refund retrieved successfully!",
    data: result,
  });
});

// Update a refund by ID
const updateRefund = catchAsync(async (req: Request, res: Response) => {
  const result = await RefundService.updateRefund(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refund updated successfully!",
    data: result,
  });
});

// Delete a refund by ID
const deleteRefund = catchAsync(async (req: Request, res: Response) => {
  await RefundService.deleteRefund(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.NO_CONTENT,
    success: true,
    message: "Refund deleted successfully!",
    data: null,
  });
});

// confirm refund a refund by ID
const refundPaymentToCustomer = catchAsync(
  async (req: Request, res: Response) => {
    const result = await RefundService.refundPaymentToCustomer(req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Refund confirm  successfully!",
      data: result,
    });
  }
);

export const RefundController = {
  createRefund,
  getAllRefunds,
  getRefundById,
  updateRefund,
  deleteRefund,
  refundPaymentToCustomer,
};
