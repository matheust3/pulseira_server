import { UserControllerImpl } from "@/app/_lib/adapters/controllers/organization/user-controller";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { handler } from "@/middlewares";

const controller = new UserControllerImpl({
  userRepository: dependencyContainer.repositories.userRepository,
  uuidService: dependencyContainer.services.uuidService,
});

export const POST = handler(controller.post.bind(controller), dependencyContainer.middlewares.guard);

export const PUT = handler(controller.put.bind(controller), dependencyContainer.middlewares.guard);

export const GET = handler(controller.get.bind(controller), dependencyContainer.middlewares.guard);
