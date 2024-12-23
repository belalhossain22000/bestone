export interface TFavorite {
    id: string;       // MongoDB ObjectId for the Favorite document
    userId: string;   // MongoDB ObjectId for the User who added the item to their favorites or wishlist
    postId: string;   // MongoDB ObjectId for the Post or Item being favorited or added to the wishlist
    createdAt: Date;  // The timestamp when the post was added to the favorites or wishlist
    updatedAt: Date;  // The timestamp when the post was last updated in the favorites or wishlist
  }
  