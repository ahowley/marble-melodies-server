import { NextFunction, Request, Response } from "express";
import { body, header } from "express-validator";
import jwt from "jsonwebtoken";
import { errorMessages } from "./config.js";
import { TokenPayload } from "../controllers/user.js";

export type AuthRequest = Request & {
  isLoggedIn: boolean | undefined;
  tokenPayload: TokenPayload | undefined;
};

const JWT_KEY = process.env.JWT_KEY;

export const jsonValidators = () => [
  header("content-type", errorMessages.contentType()).matches(/application\/json/i),
  body("", "Request body must be formatted as a JSON object.").isObject(),
];

export const requiredValidator = (field: string) => body(field, errorMessages.required(field)).notEmpty();

export const authorizeValidator = (req: AuthRequest, res: Response, next: NextFunction) => {
  req.isLoggedIn = true;
  const { authorization } = req.headers;

  if (!authorization || !authorization.includes("Bearer ")) {
    req.isLoggedIn = false;
    return;
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_KEY, (error, payload: TokenPayload) => {
    if (error) {
      req.isLoggedIn = false;
      return;
    }

    req.tokenPayload = payload;
  });
};
