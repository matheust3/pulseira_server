import { Organization } from "./organization";

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  organization: Organization;
}
