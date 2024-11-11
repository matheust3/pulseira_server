import { VerifyEmailControllerImpl } from '@/app/_lib/adapters/controllers/email-token/verify-email-controller-impl'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new VerifyEmailControllerImpl({
  verifyEmailTokenUseCase: dependencyContainer.useCases.verifyEmailTokenUseCase,
  signWithEmailOnly: dependencyContainer.useCases.signWithEmailOnly,
})

export const POST = handler(async (req, res) => {
  try {
    await controller.post(req, res)
  } catch (error) {
    console.error(error)
    res.status = 500
    res.body = { error: 'Internal server error' }
  }
}, dependencyContainer.middlewares.getEmailTokenRateLimiter)
