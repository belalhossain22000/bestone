import httpStatus from "http-status";
import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";

const toggleFavourite = async (payload: { instituteId: string }, user: any) => {
  // Check if the post exists

  const isInstitute = await prisma.institute.findUnique({
    where: {
      id: payload.instituteId,
    },
  });

  if (!isInstitute) {
    throw new ApiError(httpStatus.NOT_FOUND, "institute not found");
  }

  // Check if the favorite already exists for the user
  const existingFavourite = await prisma.favorite.findFirst({
    where: {
      userId: user.id,
      instituteId: payload.instituteId,
    },
  });

  if (existingFavourite) {
    // If it exists, remove the favorite
    const result = await prisma.favorite.delete({
      where: {
        id: existingFavourite.id,
      },
    });
    return { result, message: "Favorite item removed successfully." };
  } else {
    // If it doesn't exist, add the favorite
    const result = await prisma.favorite.create({
      data: {
        userId: user.id,
        instituteId: payload.instituteId,
      },
    });
    return { result, message: "Favorite item added successfully." };
  }
};

const getAllFavourites = async () => {
  const result = await prisma.favorite.findMany({
    include: {
      user: true,
      institute: true, // Include the related user data
    },
  });
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found any favorite");
  }
  return result;
};

const getFavouriteById = (id: string) => {
  return prisma.favorite.findUniqueOrThrow({
    where: { id },
    include: {
      user: true,
      institute: true,
    },
  });
};

const updateFavourite = (id: string, payload: { instituteId?: string }) => {
  return prisma.favorite.update({
    where: { id },
    data: payload,
  });
};

const deleteFavourite = async (id: string) => {
  const isFavouriteExist = await prisma.favorite.findUnique({
    where: { id },
  });

  if (!isFavouriteExist) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Favorite not found with the id " + id
    );
  }

  return await prisma.favorite.delete({
    where: { id },
  });
};

const getFavouritesByUser = async (userId: string) => {
  // console.log(userId);
  return await prisma.favorite.findMany({
    where: { userId },
    include: {
      institute: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const FavouriteService = {
  toggleFavourite,
  getAllFavourites,
  getFavouriteById,
  updateFavourite,
  deleteFavourite,
  getFavouritesByUser,
};
