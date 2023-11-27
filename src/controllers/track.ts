import { Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import configure from "knex";
import knexfile from "../../knexfile.js";
import { AuthRequest } from "../validation/common.js";
import { errorMessages } from "../validation/config.js";

type SerializedBody = {
  track_id: number;
  type: "marble" | "track-block" | "note-block";
  x: number | string;
  y: number | string;
  rotation: number | string;
  isStatic: boolean;
  radius?: number | string;
  width?: number | string;
  height?: number | string;
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
  previewOnPlayback: boolean;
  volume: number;
  initialState: SerializedBody[];
};
type Track = PostRequestBody & {
  id: number;
  user_id: number;
};

const sanitizeBodyForDatabase = (body: SerializedBody, trackId: number) => {
  const sanitized: SerializedBody = {
    track_id: trackId,
    type: body.type,
    x: typeof body.x === "string" ? parseFloat(body.x) : body.x,
    y: typeof body.y === "string" ? parseFloat(body.y) : body.y,
    rotation: typeof body.rotation === "string" ? parseFloat(body.rotation) : body.rotation,
    isStatic: !!body.isStatic,
  };

  if (body.type === "marble" || body.type === "note-block") {
    sanitized.gradientStart = body.gradientStart;
    sanitized.gradientEnd = body.gradientEnd;
  }

  if (body.type === "note-block" || body.type === "track-block") {
    sanitized.width = typeof body.width === "string" ? parseFloat(body.width) : body.width;
    sanitized.height = typeof body.height === "string" ? parseFloat(body.height) : body.height;
  }

  if (body.type === "marble") {
    sanitized.radius = typeof body.radius === "string" ? parseFloat(body.radius) : body.radius;
    sanitized.cameraTracking = !!body.cameraTracking;
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

export const getTrack = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(404).json({
      message: errorMessages.trackNotFound(id),
    });
  }

  const track: Track = await knex("track").where({ id }).first();
  if (!track) {
    return res.status(404).json({
      message: errorMessages.trackNotFound(id),
    });
  }

  track.previewOnPlayback = !!track.previewOnPlayback;
  const bodies: SerializedBody[] = await knex("body").where("track_id", id);
  const initialState = bodies.map((body) => sanitizeBodyForDatabase(body, id));

  return res.status(200).json({
    ...track,
    initialState,
  });
};

export const getTracks = async (_req: Request, res: Response) => {
  const tracks = await knex("track")
    .join("user", "user.id", "track.user_id")
    .select("track.id", "name", "username")
    .limit(20);

  res.status(200).json(tracks);
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
    await knex("body").insert(serializedBodies);

    return res.status(201).json({ trackId: trackId[0], message: "New track saved!" });
  } catch (error) {
    return res.status(500).json({
      message: "Unknown error",
      error,
    });
  }
};

export const putTrack = async (req: AuthRequest, res: Response) => {
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

  const id = parseInt(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(404).json({
      message: errorMessages.trackNotFound(id),
    });
  }

  const userId = req.tokenPayload.id;
  const trackUserId = await knex("track").where({ id }).select("user_id").first();
  if (!trackUserId) {
    return res.status(404).json({
      message: errorMessages.trackNotFound(id),
    });
  }
  if (!userId || userId !== trackUserId.user_id) {
    return await postTrack(req, res);
  }

  try {
    const { name, previewOnPlayback, volume, initialState } = matchedData(req) as PostRequestBody;
    await knex("body").where("track_id", id).delete();

    const serializedBodies: SerializedBody[] = initialState.map((body) => sanitizeBodyForDatabase(body, id));
    Promise.all([
      knex("body").insert(serializedBodies),
      knex("track").where({ id }).update({ name, previewOnPlayback, volume }),
    ]);

    return res.status(201).json({ trackId: id, message: "Track updated!" });
  } catch (error) {
    return res.status(500).json({
      message: "Unknown error",
      error,
    });
  }
};

export const deleteTrack = async (req: AuthRequest, res: Response) => {
  if (!req.isLoggedIn) {
    return res.status(401).json({
      message: errorMessages.notLogged(),
    });
  }

  const id = parseInt(req.params.id);
  const userId = req.tokenPayload.id;
  const trackUserId = await knex("track").where({ id }).select("user_id").first();
  if (!trackUserId) {
    return res.status(404).json({
      message: errorMessages.trackNotFound(id),
    });
  }
  if (!userId || userId !== trackUserId.user_id) {
    return res.status(403).json({
      message: errorMessages.deleteFailed(id),
    });
  }

  try {
    await knex("body").where("track_id", id).delete();
    await knex("track").where({ id }).delete();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({
      message: "Unknown error",
      error,
    });
  }
};

const knex = configure(knexfile);
