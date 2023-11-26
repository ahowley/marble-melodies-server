import { Request } from "express";
import { body, header } from "express-validator";
import { errorMessages } from "./config.js";
import { TokenPayload } from "../controllers/user.js";

export type AuthRequest = Request & {
  isLoggedIn: boolean | undefined;
  tokenPayload: TokenPayload | undefined;
};

export const jsonValidators = () => [
  header("content-type", errorMessages.contentType()).matches(/application\/json/i),
  body("", "Request body must be formatted as a JSON object.").isObject(),
];

export const requiredValidator = (field: string) => body(field, errorMessages.required(field)).notEmpty();
