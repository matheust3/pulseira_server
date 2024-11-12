import { string, StringSchema } from "yup";

export const emailValidator: StringSchema<string> = string().email().required();
