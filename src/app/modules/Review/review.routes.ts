// review.routes: Module file for the review.routes functionality.
import express from "express";
import { ReviewController } from "./review.controller";

const router = express.Router();

// Route to create a new review
router.post("/", ReviewController.createReview);


// Route to get all reviews (with optional query parameters)
router.get("/", ReviewController.getAllReviews);
// get review by course id
router.get("/review/:courseId", ReviewController.getReviewsByCourseId);
// Route to get a specific review by ID
router.get("/:id", ReviewController.getReviewById);

// Route to update a specific review by ID
router.patch("/:id", ReviewController.updateReview);

// Route to delete a specific review by ID
router.delete("/:id", ReviewController.deleteReview);

export const ReviewRoutes = router;
