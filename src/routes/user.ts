import { Router } from "express";
import { jsonValidators } from "../validation/common.js";
import { usernameValidators, passwordValidators, loginValidators, authorizeValidator } from "../validation/user.js";
import { getTracks, login, register } from "../controllers/user.js";

const router = Router();

router
  .post("/register", ...jsonValidators(), ...usernameValidators(), ...passwordValidators(), register)
  .post("/login", ...loginValidators(), login)
  .get("/track", authorizeValidator, getTracks);

export default router;
