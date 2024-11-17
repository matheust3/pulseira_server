import { object, ObjectSchema, string } from "yup";
import { Organization } from "../../core/domain/models/organization";
import { uuidV7 } from "./uuid-v7-validator";

export const organizationValidator: ObjectSchema<Organization> = object({
  id: uuidV7.required(),
  name: string().required(),
});
