import { Router } from "express";
import { jsonValidators } from "../validation/common.js";
import { postValidators } from "../validation/track.js";
import { deleteTrack, getTrack, getTracks, postTrack, putTrack } from "../controllers/track.js";
import { authorizeValidator } from "../validation/user.js";

const router = Router();

router
  .get("/:id", getTrack)
  .get("/", getTracks)
  .post("/", authorizeValidator, ...jsonValidators(), ...postValidators(), postTrack)
  .put("/:id", authorizeValidator, ...jsonValidators(), ...postValidators(), putTrack)
  .delete("/:id", authorizeValidator, deleteTrack);

export default router;
