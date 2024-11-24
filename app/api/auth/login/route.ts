import { LoginControllerImpl } from "@/app/_lib/adapters/controllers/login-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { AuthService } from "@/app/_lib/core/application/gateways/auth-service";
import { handler } from "@/middlewares";
import { LoginRateLimiter } from "@/middlewares/login-rate-limiter";

const controller = new LoginControllerImpl({ authService: dependencyContainer.get<AuthService>("AuthService") });

export const POST = handler(
  controller.post.bind(controller),
  dependencyContainer.get<LoginRateLimiter>("LoginRateLimiter"),
);
