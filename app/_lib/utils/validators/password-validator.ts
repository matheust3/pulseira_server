import { string, StringSchema } from "yup";

export const passwordValidator: StringSchema<string> = string()
  .required()
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and be at least 8 characters long.",
  )
  .matches(/^\S*$/, "Password must not contain spaces.");
