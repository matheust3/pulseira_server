import { OrganizationControllerImpl } from "@/app/_lib/adapters/controllers/organization/organization-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { OrganizationRepository } from "@/app/_lib/core/application/repositories/organization-repository";
import { handler } from "@/middlewares";
import { Guard } from "@/middlewares/guard";

const controller = new OrganizationControllerImpl({
  organizationRepository: dependencyContainer.get<OrganizationRepository>("OrganizationRepository"),
});

export const POST = handler(controller.post.bind(controller), dependencyContainer.get<Guard>("Guard"));

export const GET = handler(controller.get.bind(controller), dependencyContainer.get<Guard>("Guard"));

export const PUT = handler(controller.put.bind(controller), dependencyContainer.get<Guard>("Guard"));
