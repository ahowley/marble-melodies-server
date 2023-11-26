import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcrypt";
import { validationResult, matchedData, FieldValidationError } from "express-validator";
import configure from "knex";
import knexfile from "../../knexfile.js";
import { errorMessages, useDotenv } from "../validation/config.js";
import { error } from "console";

type User = {
  id: number;
  username: string;
  password_hash: string;
};
export type TokenPayload = Omit<User, "password_hash">;

useDotenv();
const JWT_KEY = process.env.JWT_KEY;
const knex = configure(knexfile);

export const register = async (req: Request, res: Response) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      message: errorMessages.invalid(),
      errors: validationErrors
        .array()
        .map((error: FieldValidationError) => ({
          ...error,
          value: error.path === "password" ? "hidden" : error.value,
        })),
    });
  }

  const { username, password } = matchedData(req);
  hash(password, 10, async (error, password_hash) => {
    if (error) {
      return res.status(500).json({
        message: errorMessages.failedPasswordEncryption,
      });
    }

    const newUserId = await knex("user").insert([{ username, password_hash }]);
    res.status(201).json({
      id: newUserId,
    });
  });
};

export const login = async (req: Request, res: Response) => {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      message: errorMessages.invalid(),
      errors: validationErrors.array(),
    });
  }

  const { username, password } = matchedData(req);
  let user: User | null = await knex("user").where({ username }).first();
  if (!user) {
    return res.status(401).json({
      message: errorMessages.auth(),
    });
  }

  compare(password, user.password_hash, (error, result) => {
    if (error || !result) {
      return res.status(401).json(errorMessages.auth());
    }

    const payload: TokenPayload = { id: user.id, username: user.username };
    const token = jwt.sign(payload, JWT_KEY);

    return res.status(200).json({ id: user.id, token });
  });
};
