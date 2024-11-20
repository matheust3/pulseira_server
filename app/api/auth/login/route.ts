import { LoginControllerImpl } from "@/app/_lib/adapters/controllers/login-controller-impl";
import { dependencyContainer } from "@/app/_lib/config/dependency-container";
import { handler } from "@/middlewares";

const controller = new LoginControllerImpl({ authService: dependencyContainer.services.authService });

export const POST = handler(controller.post.bind(controller), dependencyContainer.middlewares.loginRateLimiter);
