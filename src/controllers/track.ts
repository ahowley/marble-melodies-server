import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import configure from "knex";
import knexfile from "../../knexfile.js";
import { AuthRequest } from "../validation/common.js";
import { errorMessages } from "../validation/config.js";

type SerializedBody = {
  track_id: number;
  type: "marble" | "track-block" | "note-block";
  x: number;
  y: number;
  rotation: number;
  isStatic: boolean;
  radius?: number;
  width?: number;
  height?: number;
  gradientStart?: string | number;
  gradientEnd?: string | number;
  frontColor?: string;
  backColor?: string;
  cameraTracking?: boolean;
  note?: string;
  octave?: string;
  volume?: number;
};
type PostRequestBody = {
  name: string;
  previewOnPlayback: string;
  volume: number;
  initialState: SerializedBody[];
};
type Track = PostRequestBody & {
  id: number;
};

const sanitizeBodyForDatabase = (body: SerializedBody, trackId: number) => {
  const sanitized: SerializedBody = {
    track_id: trackId,
    type: body.type,
    x: body.x,
    y: body.y,
    rotation: body.rotation,
    isStatic: body.isStatic,
  };

  if (body.type === "marble" || body.type === "note-block") {
    sanitized.gradientStart = body.gradientStart;
    sanitized.gradientEnd = body.gradientEnd;
  }

  if (body.type === "note-block" || body.type === "track-block") {
    sanitized.width = body.width;
    sanitized.height = body.height;
  }

  if (body.type === "marble") {
    sanitized.radius = body.radius;
    sanitized.cameraTracking = body.cameraTracking;
  }

  if (body.type === "track-block") {
    sanitized.frontColor = body.frontColor;
    sanitized.backColor = body.backColor;
  }

  if (body.type === "note-block") {
    sanitized.note = body.note;
    sanitized.octave = body.octave;
    sanitized.volume = body.volume;
  }

  return sanitized;
};

export const postTrack = async (req: AuthRequest, res: Response) => {
  if (!req.isLoggedIn) {
    return res.status(401).json({
      message: errorMessages.notLogged(),
    });
  }

  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({
      message: errorMessages.invalid(),
      errors: validationErrors.array(),
    });
  }

  try {
    const { name, previewOnPlayback, volume, initialState } = matchedData(req) as PostRequestBody;
    const { tokenPayload } = req;
    const user_id = tokenPayload.id;
    const trackId = await knex("track").insert([{ name, user_id, previewOnPlayback, volume }]);
    const serializedBodies: SerializedBody[] = initialState.map((body) => sanitizeBodyForDatabase(body, trackId[0]));
    const bodyIds = await knex("body").insert(serializedBodies);

    return res.status(201).json({ trackId: trackId[0], firstBodyId: bodyIds[0] });
  } catch (error) {
    return res.status(500).json({
      message: "Unknown error",
      error,
    });
  }
};

export const getTrack = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const track: Track = await knex("track").where({ id }).first();
  if (!track) {
    return res.status(404).json({
      message: errorMessages.trackNotFound,
    });
  }

  const bodies: SerializedBody[] = await knex("body").join("track", "track.id", "body.track_id").where("track.id", id);
  const initialState = bodies.map((body) => sanitizeBodyForDatabase(body, id));

  return res.status(200).json({
    ...track,
    initialState,
  });
};

const knex = configure(knexfile);
