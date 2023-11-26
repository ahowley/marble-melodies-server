import { Router } from "express";
import { jsonValidators } from "../validation/common.js";
import { usernameValidators, passwordValidators, loginValidators } from "../validation/user.js";
import { login, register } from "../controllers/user.js";

const router = Router();

router
  .post("/register", ...jsonValidators(), ...usernameValidators(), ...passwordValidators(), register)
  .post("/login", ...loginValidators(), login);

export default router;
