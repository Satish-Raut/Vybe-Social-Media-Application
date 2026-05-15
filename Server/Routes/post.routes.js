import express from "express";
import { upload } from "../configs/multer.js";
import { protect } from "../Middlewares/auth.js";
import { addPost, getFeedPost, likePost } from "../Controllers/post.controller.js";

const postRouter = express.Router();

postRouter.post("/add", upload.array("images", 4), protect, addPost);

postRouter.get("/feed", protect, getFeedPost);

postRouter.get("/like", protect, likePost);

export default postRouter;