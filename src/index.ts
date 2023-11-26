import path from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import userRouter from "./routes/user.js";
import trackRouter from "./routes/track.js";

const entry = new URL(import.meta.url).pathname;
const __dirname = path.dirname(entry).replace("/src", "");
dotenv.config({ path: `${__dirname}/.env` });

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.use("/user", userRouter);
app.use("/track", trackRouter);

app.listen(PORT, () => console.log(`Listening on port ${PORT}!`));
