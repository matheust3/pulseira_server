import { SendEmailControllerImpl } from '@/app/_lib/adapters/controllers/email-token/send-email-controller'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new SendEmailControllerImpl({
  createEmailTokenUseCase: dependencyContainer.useCases.createEmailTokenUseCase,
  sendEmailTokenUseCase: dependencyContainer.useCases.sendEmailTokenUseCase,
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
