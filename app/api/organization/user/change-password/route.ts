import { ChangePasswordControllerImpl } from "@/app/_lib/adapters/controllers/organization/user/change-password-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { AuthService } from "@/app/_lib/core/application/gateways/auth-service";
import { UserRepository } from "@/app/_lib/core/application/repositories/user-repository";
import { handler } from "@/middlewares";
import { Guard } from "@/middlewares/guard";

const controller = new ChangePasswordControllerImpl({
  userRepository: dependencyContainer.get<UserRepository>("UserRepository"),
  authService: dependencyContainer.get<AuthService>("AuthService"),
});

export const POST = handler(controller.post.bind(controller), dependencyContainer.get<Guard>("Guard"));
