import { GetAccountStatusController } from '@/app/_lib/adapters/controllers/account/get-account-status-controller'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new GetAccountStatusController({
  getAccountStatusUseCase: dependencyContainer.useCases.getAccountStatusUseCase,
})

export const GET = handler(async (req, res) => {
  try {
    await controller.get(req, res)
  } catch (error) {
    res.status = 500
    res.body = { error: 'internal server error' }
    console.log(error)
  }
}, dependencyContainer.middlewares.authMiddleware)
