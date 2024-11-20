import { bool, object, ObjectSchema } from "yup";
import { Permissions } from "../../core/domain/models/permissions";
import { uuidV7 } from "./uuid-v7-validator";

export const userPermissionsValidator: ObjectSchema<Permissions> = object({
  id: uuidV7.required(),
  manageUsers: bool().required(),
});
