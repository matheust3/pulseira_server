import { Organization } from "../../domain/models/organization";

export interface OrganizationRepository {
  create(organization: Organization): Promise<Organization>;
  update(organization: Organization): Promise<Organization>;
  getAll(): Promise<Organization[]>;
  getByCnpj(cnpj: string): Promise<Organization>;
}
