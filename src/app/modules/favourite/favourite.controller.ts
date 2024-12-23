import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { FavouriteService } from "./favourite.services";
import ApiError from "../../../errors/ApiErrors";

// Controller to add or remove a post from the user's favorites
const toggleFavourite = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const { result, message } = await FavouriteService.toggleFavourite(
    req.body,
    user
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: message,
    data: result,
  });
});

// Controller to get all favorites (admin use case)
const getAllFavourites = catchAsync(async (req: Request, res: Response) => {
  const result = await FavouriteService.getAllFavourites();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Favorites retrieved successfully.",
    data: result,
  });
});

// Controller to get a specific favorite by ID
const getFavouriteById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FavouriteService.getFavouriteById(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Favorite retrieved successfully.",
    data: result,
  });
});

// Controller to update a specific favorite
const updateFavourite = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;


  const result = await FavouriteService.updateFavourite(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Favorite updated successfully.",
    data: result,
  });
});

// Controller to delete a favorite by ID
const deleteFavourite = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = req.user as any;
  const result = await FavouriteService.deleteFavourite(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: " Remove from Favorite list  successfully.",
    data: result,
  });
});

// Controller to get all favorites by user
const getFavouritesByUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as any;
  
  const result = await FavouriteService.getFavouritesByUser(user.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User's favorites retrieved successfully.",
    data: result,
  });
});

export const FavouriteController = {
  toggleFavourite,
  getAllFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavourite,
  getFavouritesByUser,
};
