import express from "express";
import cors from "cors";

import userRouter from "./routes/user.js";
import trackRouter from "./routes/track.js";
import { useDotenv } from "./validation/config.js";

useDotenv();
const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use("/user", userRouter);
app.use("/track", trackRouter);

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
