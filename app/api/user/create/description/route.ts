import { CreateDescriptionControllerImpl } from '@/app/_lib/adapters/controllers/user/create-description-controller'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new CreateDescriptionControllerImpl({
  updateUserUseCase: dependencyContainer.useCases.updateUserUseCase,
})

export const PUT = handler(async (req, res) => {
  try {
    await controller.put(req, res)
  } catch (error) {
    res.status = 500
    res.body = { error: 'internal server error' }
    console.error(error)
  }
}, dependencyContainer.middlewares.authMiddleware)
