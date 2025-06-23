import { UserControllerImpl } from "@/app/_lib/adapters/controllers/organization/user-controller";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { UuidService } from "@/app/_lib/core/application/gateways/uuid-service";
import { UserRepository } from "@/app/_lib/core/application/repositories/user-repository";
import { handler } from "@/middlewares";
import { Guard } from "@/middlewares/guard";

const controller = new UserControllerImpl({
  userRepository: dependencyContainer.get<UserRepository>("UserRepository"),
  uuidService: dependencyContainer.get<UuidService>("UuidService"),
});

export const POST = handler(controller.post.bind(controller), dependencyContainer.get<Guard>("Guard"));

export const PUT = handler(controller.put.bind(controller), dependencyContainer.get<Guard>("Guard"));

export const GET = handler(controller.get.bind(controller), dependencyContainer.get<Guard>("Guard"));
