import { bool, object, ObjectSchema, string } from "yup";
import { Permissions } from "../../core/domain/models/permissions";

export const userPermissionsValidator: ObjectSchema<Permissions> = object({
  id: string().uuid().required(),
  manageUsers: bool().required(),
});
