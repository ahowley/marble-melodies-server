import { requiredValidator } from "./common.js";

export const postValidators = () => [
  requiredValidator("name"),
  requiredValidator("previewOnPlayback"),
  requiredValidator("volume"),
  requiredValidator("initialState"),
];
