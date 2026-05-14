import express from "express";
import {
  acceptConnectionRequest,
  discoverUsers,
  followUsers,
  getuserConnections,
  getUserdata,
  sendConnectionRequest,
  unfollowUsers,
  updateUserdata,
} from "../Controllers/userController.controller.js";
import { protect } from "../Middlewares/auth.js";
import { upload } from "../configs/multer.js";

const userRouter = express.Router();

// Route to get the user data form database
userRouter.get("/data", protect, getUserdata);

// post user data with profile and cover image
userRouter.post(
  "/update",
  upload.fields([
    { name: "profile", maxCount: 1 },
    { name: "cover", maxCount: 1 },
  ]),
  protect,
  updateUserdata,
);

// Get the current user details
userRouter.post("/discover", protect, discoverUsers);

// follow user data sored in database
userRouter.post("/follow", protect, followUsers);

// unfollow user data sored in database
userRouter.post("/unfollow", protect, unfollowUsers);

// Connection request
userRouter.post("/connect", protect, sendConnectionRequest);

// Accept Connection request
userRouter.post("/accept", protect, acceptConnectionRequest);

// Get all Connection details
userRouter.get("/connections", protect, getuserConnections);
export default userRouter;
