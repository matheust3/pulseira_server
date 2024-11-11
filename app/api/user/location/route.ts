import { LocationControllerImpl } from '@/app/_lib/adapters/controllers/location-controller-impl'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new LocationControllerImpl({
  saveLocationUseCase: dependencyContainer.useCases.saveLocationUseCase,
})

export const PUT = handler(async (req, res) => {
  await controller.put(req, res)
}, dependencyContainer.middlewares.authMiddleware)
