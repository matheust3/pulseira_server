import { OrganizationController } from "@/app/_lib/core/application/controllers/organization/organization-controller";
import { OrganizationRepository } from "@/app/_lib/core/application/repositories/organization-repository";
import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Request } from "@/app/_lib/core/domain/models/routes/request";

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
        // const organization = await this.organizationRepository.create(req.body);
        res.status = 201;
        // res.body = organization;
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
