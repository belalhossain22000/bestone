import express from "express";
import { FavouriteController } from "./favourite.controller";
import auth from "../../middlewares/auth";


const router = express.Router();

// Route to toggle a favorite (add/remove)
router.post("/toggle", auth(), FavouriteController.toggleFavourite);

// Route to get all favorites (admin)
router.get("/", FavouriteController.getAllFavourites);

// Route to get all favorites of a user
router.get("/user", auth(), FavouriteController.getFavouritesByUser);

// Route to get a favorite by ID
router.get("/:id", FavouriteController.getFavouriteById);



// Route to update a favorite
router.put("/:id",auth(), FavouriteController.updateFavourite);

// Route to delete a favorite by ID
router.delete("/:id",auth(), FavouriteController.deleteFavourite);

export const favouriteRoutes = router;
