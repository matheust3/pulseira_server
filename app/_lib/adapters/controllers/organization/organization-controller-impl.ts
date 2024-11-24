import { OrganizationController } from "@/app/_lib/core/application/controllers/organization/organization-controller";
import { OrganizationRepository } from "@/app/_lib/core/application/repositories/organization-repository";
import { InvalidJsonError } from "@/app/_lib/core/domain/errors/invalid-json-error";
import { Organization } from "@/app/_lib/core/domain/models/organization";
import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Request } from "@/app/_lib/core/domain/models/routes/request";
import { organizationValidator } from "@/app/_lib/utils/validators/organization-validator";
import { ValidationError } from "yup";

export class OrganizationControllerImpl implements OrganizationController {
  private readonly organizationRepository: OrganizationRepository;

  constructor(args: { organizationRepository: OrganizationRepository }) {
    this.organizationRepository = args.organizationRepository;
  }

  async get(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization.user === undefined) {
      res.status = 401;
      res.body = { message: "Unauthorized" };
    } else {
      if (req.authorization.user.permissions.manageOrganizations) {
        const organizations = await this.organizationRepository.getAll();
        res.status = 200;
        res.body = organizations;
      } else {
        res.status = 403;
        res.body = { message: "Forbidden" };
      }
    }
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization.user === undefined) {
      res.status = 401;
      res.body = { message: "Unauthorized" };
    } else {
      if (req.authorization.user.permissions.manageOrganizations) {
        try {
          const body = (await req.json()) as { organization: Organization };
          const validOrganization = await organizationValidator.validate(body.organization);
          try {
            await this.organizationRepository.getByCnpj(validOrganization.cnpj);
            res.status = 409;
            res.body = { error: "Organization with this CNPJ already exists" };
          } catch (error) {
            const organization = await this.organizationRepository.create(validOrganization);
            res.status = 201;
            res.body = { organization };
          }
        } catch (error) {
          if (error instanceof InvalidJsonError) {
            res.status = 400;
            res.body = { error: "Invalid JSON" };
          } else if (error instanceof ValidationError) {
            res.status = 400;
            res.body = { error: error.message };
          } else {
            throw error;
          }
        }
      } else {
        res.status = 403;
        res.body = { message: "Forbidden" };
      }
    }
  }

  async put(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization.user === undefined) {
      res.status = 401;
      res.body = { message: "Unauthorized" };
    } else {
      if (req.authorization.user.permissions.manageOrganizations) {
        // await this.organizationRepository.update(req.body);
        res.status = 204;
      } else {
        res.status = 403;
        res.body = { message: "Forbidden" };
      }
    }
  }
}
