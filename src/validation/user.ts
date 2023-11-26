import { NextFunction, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import configure from "knex";
import knexfile from "../../knexfile.js";
import { MIN_PASSWORD_LENGTH, errorMessages, useDotenv } from "./config.js";
import { AuthRequest, requiredValidator } from "./common.js";
import { TokenPayload } from "../controllers/user.js";

useDotenv();
const knex = configure(knexfile);
const JWT_KEY = process.env.JWT_KEY;

const validateUniqueUsername = async (username: string) => {
  const usernames = await knex("user").select("username").where({ username });
  if (usernames.length) {
    throw new Error(errorMessages.unique("username"));
  }
};

export const usernameValidators = () => [
  requiredValidator("username"),
  body("username").custom(validateUniqueUsername),
];

export const passwordValidators = () => [
  requiredValidator("password"),
  body("password", errorMessages.passwordLength()).isLength({ min: MIN_PASSWORD_LENGTH }),
  body("password", errorMessages.passwordWhitespace()).matches(/^\S+$/),
  body("password", errorMessages.passwordLowercase()).notEmpty().matches(/[a-z]/),
  body("password", errorMessages.passwordUppercase()).matches(/[A-Z]/),
  body("password", errorMessages.passwordSpecial()).matches(/[^a-zA-Z0-9]/),
];

export const loginValidators = () => [requiredValidator("username"), requiredValidator("password")];

export const authorizeValidator = (req: AuthRequest, _res: Response, next: NextFunction) => {
  req.isLoggedIn = true;
  const { authorization } = req.headers;

  if (!authorization || !authorization.includes("Bearer ")) {
    req.isLoggedIn = false;
    return;
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_KEY, (error, payload: TokenPayload) => {
    if (error) {
      console.log(error);
      req.isLoggedIn = false;
      return;
    }

    req.tokenPayload = payload;
  });

  next();
};
