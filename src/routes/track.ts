import { Router } from "express";
import { jsonValidators } from "../validation/common.js";
import { postValidators, putValidators } from "../validation/track.js";
import { getTrack, postTrack } from "../controllers/track.js";
import { authorizeValidator } from "../validation/user.js";

const router = Router();

router.get("/:id", getTrack).post("/", authorizeValidator, ...jsonValidators(), ...postValidators(), postTrack);

export default router;
