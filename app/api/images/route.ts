import { ImagesControllerImpl } from '@/app/_lib/adapters/controllers/images/images-controller-impl'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new ImagesControllerImpl({
  savaImageUseCase: dependencyContainer.useCases.saveImageUseCase,
  deleteImageUseCase: dependencyContainer.useCases.deleteImageUseCase,
})

export const DELETE = handler(async (req, res) => {
  await controller.delete(req, res)
}, dependencyContainer.middlewares.authMiddleware)

export const POST = handler(async (req, res) => {
  await controller.post(req, res)
}, dependencyContainer.middlewares.authMiddleware)
