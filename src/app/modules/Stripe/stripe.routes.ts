// stripe.routes: Module file for the stripe.routes functionality.
import express from "express";
import { StripeController } from "./stripe.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// get all payment method each user 
router.get("/payment-methods", auth(), StripeController.getPaymentMethodList);

// Get payment history for a student
router.get(
    '/payment-history',
    auth(),
    StripeController.getPaymentHistory
  );

// create a new payment method
router.post("/create-intent", auth(), StripeController.createPaymentIntent);

// Get single payment details
router.get(
  '/payment-details/:paymentId',
  auth(),
  StripeController.getPaymentDetails
);
  

export const StripeRoutes = router;
