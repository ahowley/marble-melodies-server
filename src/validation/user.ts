import configure from "knex";
import knexfile from "../../knexfile.js";
import { MIN_PASSWORD_LENGTH, errorMessages } from "./config.js";
import { body } from "express-validator";
import { requiredValidator } from "./common.js";

const knex = configure(knexfile);

const validateUniqueUsername = async (username: string) => {
  const usernames = await knex("user").select("username").where({ username: username });
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
