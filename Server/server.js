import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";

import { functions, inngest } from "./inngest/index.js";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

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

// {Listen on a Port number}
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
