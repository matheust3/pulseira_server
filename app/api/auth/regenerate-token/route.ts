import { RegenerateTokenControllerImpl } from "@/app/_lib/adapters/controllers/regenerate-token-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { handler } from "@/middlewares";

const controller = new RegenerateTokenControllerImpl({
  authService: dependencyContainer.services.authService,
});

export const GET = handler(controller.get.bind(controller), dependencyContainer.middlewares.guard);
