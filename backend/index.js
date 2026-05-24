import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL
];

const corsOptions = {
  origin: function (origin, callback) {

    // Allow requests with no origin
    // (Postman, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Allow localhost during development
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }

    // Allow frontend URL from env
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
connectDB();
app.use(notFound);
app.use(errorHandler);
app.use("/api/auth",authRoutes)

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


export default app;