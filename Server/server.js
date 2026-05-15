import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";

import { functions, inngest } from "./inngest/index.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import userRouter from "./Routes/userRoutes.js";
import postRouter from "./Routes/post.routes.js";
import storyRouter from "./Routes/story.routes.js";
import messageRouter from "./Routes/message.routes.js";

// {Step-1: Create Server}
const app = express();

// {Before Moving ahead connect to the database first.}
await connectDB();

// {Step-2: Define Middlewares}
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

// {Step-3: Define API Methods}
app.get("/", (req, res) => {
  res.send("Server is Running");
});
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/story", storyRouter);
app.use("/api/message", messageRouter);

// {Listen on a Port number}
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
