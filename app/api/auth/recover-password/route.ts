import { RecoverPasswordControllerImpl } from "@/app/_lib/adapters/controllers/recover-password-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { EmailProvider } from "@/app/_lib/core/application/gateways/external/email-provider";
import { UserRepository } from "@/app/_lib/core/application/repositories/user-repository";
import { handler } from "@/middlewares";
import { RecoverPasswordRateLimiter } from "@/middlewares/recover-password-rate-limiter";

const controller = new RecoverPasswordControllerImpl({
  userRepository: dependencyContainer.get<UserRepository>("UserRepository"),
  emailProvider: dependencyContainer.get<EmailProvider>("EmailProvider"),
});

export const POST = handler(
  controller.post.bind(controller),
  dependencyContainer.get<RecoverPasswordRateLimiter>("RecoverPasswordRateLimiter"),
);
