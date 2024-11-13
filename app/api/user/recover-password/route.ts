import { RecoverPasswordControllerImpl } from "@/app/_lib/adapters/controllers/recover-password-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { handler } from "@/middlewares";

const controller = new RecoverPasswordControllerImpl({
  userRepository: dependencyContainer.repositories.userRepository,
  emailProvider: dependencyContainer.gateways.emailProvider,
});

export const POST = handler(
  controller.post.bind(controller),
  dependencyContainer.middlewares.recoverPasswordRateLimiter,
);
