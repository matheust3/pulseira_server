import { RegenerateTokenControllerImpl } from "@/app/_lib/adapters/controllers/regenerate-token-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { AuthService } from "@/app/_lib/core/application/gateways/auth-service";
import { handler } from "@/middlewares";
import { Guard } from "@/middlewares/guard";

const controller = new RegenerateTokenControllerImpl({
  authService: dependencyContainer.get<AuthService>("AuthService"),
});

export const GET = handler(controller.get.bind(controller), dependencyContainer.get<Guard>("Guard"));
