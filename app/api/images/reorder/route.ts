import { ReorderImagesControllerImpl } from '@/app/_lib/adapters/controllers/images/reorder/reorder-images-controller-impl'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new ReorderImagesControllerImpl({
  reorderImagesUseCase: dependencyContainer.useCases.reorderImagesUseCase,
})

export const PUT = handler(async (req, res) => {
  await controller.put(req, res)
}, dependencyContainer.middlewares.authMiddleware)
