// refund.routes: Module file for the refund.routes functionality.
import express from "express";
import { RefundController } from "./refund.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

// Create a new refund
router.post(
  "/",
  //   auth(UserRole.USER),
  RefundController.createRefund
);

// Get all refunds
router.get(
  "/",
  //   auth(UserRole.ADMIN),
  RefundController.getAllRefunds
);

// Get a specific refund by ID
router.get(
  "/:id",
  //   auth(UserRole.ADMIN, UserRole.USER),
  RefundController.getRefundById
);

// Confirm a refund
router.put(
  "/confirm",
  //   auth(UserRole.ADMIN, UserRole.USER),
  RefundController.refundPaymentToCustomer
);

// Update a specific refund by ID
router.put(
  "/:id",
  //   auth(UserRole.ADMIN),
  RefundController.updateRefund
);

// Delete a specific refund by ID
router.delete(
  "/:id",
  //   auth(UserRole.ADMIN),
  RefundController.deleteRefund
);

export const RefundRoutes = router;
