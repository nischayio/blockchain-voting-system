import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// route imports
import voteRoutes from "./routes/voteRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import batchRoutes from "./routes/batchRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import electionRoutes from "./routes/electionRoutes.js";

// services imports

dotenv.config();

await connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

// Vote routes
app.use("/api/v1/votes", voteRoutes);
app.use("/api/v1/verify", verifyRoutes);
app.use("/api/v1/batches", batchRoutes);

// Election routes
app.use("/api/v1/elections", electionRoutes);

// Auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Blockchain Voting API is running...");
});

app.listen(PORT, () => {
  console.log(`Blockchain Voting System listening at port: ${PORT}`);
});
