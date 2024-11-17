import { object, ObjectSchema, string } from "yup";
import { User } from "../../core/domain/models/user";
import { organizationValidator } from "./organization-validator";
import { userPermissionsValidator } from "./user-permissions-validator";
import { uuidV7 } from "./uuid-v7-validator";

export const userValidator: ObjectSchema<User> = object({
  id: uuidV7.required(),
  email: string().email().required(),
  password: string().optional(),
  name: string().required(),
  organization: organizationValidator.required(),
  permissions: userPermissionsValidator.required(),
});
