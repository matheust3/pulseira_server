import { CreateUserControllerImpl } from '@/app/_lib/adapters/controllers/user/create-user-controller-impl'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new CreateUserControllerImpl({
  createUserUseCase: dependencyContainer.useCases.createUserUseCase,
  getAccountStatusUseCase: dependencyContainer.useCases.getAccountStatusUseCase,
  getEmailFromTokenUseCase:
    dependencyContainer.useCases.getEmailFromTokenUseCase,
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
