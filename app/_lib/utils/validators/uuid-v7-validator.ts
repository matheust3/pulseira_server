import { string, StringSchema } from "yup";

export const uuidV7: StringSchema<string | undefined> = string().matches(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  "Invalid UUID v7",
);
