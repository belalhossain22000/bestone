// stripe.controller: Module file for the stripe.controller functionality.

import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { stripeService } from "./stripe.service";
import sendResponse from "../../../shared/sendResponse";
import httpStatus from "http-status";

// Get all institutes
const createPaymentIntent = catchAsync(async (req: Request, res: Response) => {
  const result = await stripeService.createPaymentIntent(req.body,req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "payment intent created success fully!",
    data: result,
  });
});

// Get all institutes
const getPaymentMethodList = catchAsync(async (req: Request, res: Response) => {
  const result = await stripeService.getPaymentMethodList(req.user);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "payment method list reterive success fully!",
    data: result,
  });
});

export const StripeController = {
  createPaymentIntent,
  getPaymentMethodList
};
