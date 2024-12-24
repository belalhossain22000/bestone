// stripe.routes: Module file for the stripe.routes functionality.
import express from "express";
import { StripeController } from "./stripe.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

// get all payment method each user 
router.get("/payment-methods", auth(), StripeController.getPaymentMethodList);

// create a new payment method
router.post("/create-intent", auth(), StripeController.createPaymentIntent);


export const StripeRoutes = router;
