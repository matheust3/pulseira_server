import { PrismaClient } from "@prisma/client";
import { OrganizationRepository } from "../../core/application/repositories/organization-repository";
import { Organization, organizationKeys } from "../../core/domain/models/organization";
import { UuidService } from "../../core/application/gateways/uuid-service";
import { OrganizationNotFoundError } from "../../core/domain/errors/organization-not-found-error";
import { pick } from "lodash";

export class OrganizationRepositoryImpl implements OrganizationRepository {
  private readonly prismaClient: PrismaClient;
  private readonly uuidService: UuidService;

  constructor(args: { prismaClient: PrismaClient; uuidService: UuidService }) {
    this.prismaClient = args.prismaClient;
    this.uuidService = args.uuidService;
  }

  async create(organization: Organization): Promise<Organization> {
    const orgWithId = { ...organization, id: this.uuidService.generateV7() };
    const result = await this.prismaClient.organization.create({ data: orgWithId });
    // Copia os parâmetros de result para um novo objeto com base na interface Organization
    const org = pick(result, organizationKeys) as Organization;
    return org;
  }

  async update(organization: Organization): Promise<Organization> {
    const result = await this.prismaClient.organization.update({
      where: { id: organization.id },
      data: organization,
    });
    const updatedOrg = pick(result, organizationKeys) as Organization;
    return updatedOrg;
  }

  async getAll(): Promise<Organization[]> {
    const results = await this.prismaClient.organization.findMany();
    const organizations = results.map((result) => pick(result, organizationKeys) as Organization);
    return organizations;
  }

  async getByCnpj(cnpj: string): Promise<Organization> {
    const result = await this.prismaClient.organization.findUnique({
      where: { cnpj },
    });
    if (!result) {
      throw new OrganizationNotFoundError();
    }
    const organization = pick(result, organizationKeys) as Organization;
    return organization;
  }
}
