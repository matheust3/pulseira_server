import { string, StringSchema } from "yup";

export const uuidV7: StringSchema<string | undefined> = string().matches(
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/,
);
