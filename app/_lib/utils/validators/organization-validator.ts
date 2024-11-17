import { object, ObjectSchema, string } from "yup";
import { Organization } from "../../core/domain/models/organization";

export const organizationValidator: ObjectSchema<Organization> = object({
  id: string().uuid().required(),
  name: string().required(),
});
