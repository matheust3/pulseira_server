import { UserControllerImpl } from '@/app/_lib/adapters/controllers/user/user-controller-impl'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new UserControllerImpl({
  loadUseCases: dependencyContainer.useCases,
})

export const GET = handler(async (req, res) => {
  await controller.get(req, res)
}, dependencyContainer.middlewares.authMiddleware)

export const PUT = handler(async (req, res) => {
  await controller.put(req, res)
}, dependencyContainer.middlewares.authMiddleware)
