import { ChangePasswordControllerImpl } from "@/app/_lib/adapters/controllers/organization/user/change-password-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { handler } from "@/middlewares";

const controller = new ChangePasswordControllerImpl({
  userRepository: dependencyContainer.repositories.userRepository,
  authService: dependencyContainer.services.authService,
});

export const POST = handler(controller.post.bind(controller), dependencyContainer.middlewares.guard);
