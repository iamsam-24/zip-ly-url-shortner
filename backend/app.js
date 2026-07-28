import dns from "dns"
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import express from "express";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/mongo.config.js";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import shortUrlRoute from "./src/routes/short_url.route.js";
import { attachUser } from "./src/utils/attachUser.js";
import { redirectFromShortUrl } from "./src/controller/short_url.controller.js";
import { errorHandler } from "./src/utils/errorHandler.js";

import rateLimiter from "./src/limiter/rate.limiter.js";

const app = express();

// Database Connection
connectDB();

// Middlewares
app.use(rateLimiter)
app.use(cors({
    origin: true, // Allow request from any frontend origin
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static("public"));

// Route Registrations
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", attachUser, shortUrlRoute);

// Redirection handler (keep at root level, but use controller for click tracking)
app.get("/:id", redirectFromShortUrl);

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Started on port ${PORT}`);
});
