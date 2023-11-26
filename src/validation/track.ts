import configure from "knex";
import knexfile from "../../knexfile.js";
import { body } from "express-validator";
import { errorMessages } from "./config.js";
import { requiredValidator } from "./common.js";

const knex = configure(knexfile);

const validateTrackExists = async (trackId: number) => {
  const tracks = await knex("track").where({ id: trackId });
  if (!tracks.length) {
    throw new Error(errorMessages.trackNotFound(trackId));
  }
};

export const postValidators = () => [
  requiredValidator("name"),
  requiredValidator("previewOnPlayback"),
  requiredValidator("volume"),
  requiredValidator("initialState"),
];
