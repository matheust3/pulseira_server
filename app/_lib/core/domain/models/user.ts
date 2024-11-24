import { Organization } from "./organization";
import { Permissions } from "./permissions";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  password?: string;
  permissions: Permissions;
  organization: Organization;
  isArchived: boolean;
}
