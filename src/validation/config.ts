import dotenv from "dotenv";
import path from "path";

const entry = new URL(import.meta.url).pathname;
const __dirname = path.dirname(entry).replace("/src/validation", "");
export const useDotenv = () => dotenv.config({ path: `${__dirname}/.env` });

export const MIN_PASSWORD_LENGTH = 10;

export const errorMessages = {
  invalid: () => "Request failed validation.",
  contentType: () => 'content-type header must be "application/json"',
  required: (field: string) => `'${field}' is a required field, but no value was provided.`,
  wrongType: (field: string, expectedType: string) =>
    `The value of '${field}' provided was the wrong type. Provided: '${typeof field}' | Expected: ${expectedType}`,
  unique: (field: string) => `'${field}' must be a unique value.`,
  auth: () => "Incorrect username or password.",
  notLogged: () => "User must be logged in to use this endpoint.",
  passwordWhitespace: () => "Password cannot contain whitespace.",
  passwordLength: () => `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
  passwordLowercase: () => "Password must contain at least 1 lowercase character.",
  passwordUppercase: () => "Password must contain at least 1 uppercase character.",
  passwordSpecial: () => "Password must contain at least 1 special character.",
  failedPasswordEncryption: () => "Failed to encrypt password.",
  trackNotFound: (trackId: number) => `There was no track found with id ${trackId}`,
};
