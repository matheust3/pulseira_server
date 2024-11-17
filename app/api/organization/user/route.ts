import { CreateUserControllerImpl } from "@/app/_lib/adapters/controllers/create-user-controller";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { handler } from "@/middlewares";

const controller = new CreateUserControllerImpl({
  userRepository: dependencyContainer.repositories.userRepository,
  uuidService: dependencyContainer.services.uuidService,
});

export const POST = handler(controller.post.bind(controller), dependencyContainer.middlewares.guard);
