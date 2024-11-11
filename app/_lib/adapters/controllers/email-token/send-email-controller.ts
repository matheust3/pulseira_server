import { SendEmailController } from '@/app/_lib/core/application/controllers/email-token/send-email-controller'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { CreateEmailTokenUseCase } from '@/app/_lib/core/domain/usecases/email-token/create-email-token-use-case'
import { SendEmailTokenUseCase } from '@/app/_lib/core/domain/usecases/email-token/send-email-token-use-case'

export class SendEmailControllerImpl implements SendEmailController {
  private readonly createEmailTokenUseCase: CreateEmailTokenUseCase
  private readonly sendEmailTokenUseCase: SendEmailTokenUseCase

  constructor(args: {
    createEmailTokenUseCase: CreateEmailTokenUseCase
    sendEmailTokenUseCase: SendEmailTokenUseCase
  }) {
    this.createEmailTokenUseCase = args.createEmailTokenUseCase
    this.sendEmailTokenUseCase = args.sendEmailTokenUseCase
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    let json: { email?: string } = {}

    try {
      json = (await req.json()) as typeof json
    } catch (error) {
      res.body = { error: 'Json is required' }
      res.status = 400
      return
    }

    const { email } = json
    if (email === undefined) {
      res.body = { error: 'Email is required' }
      res.status = 400
    } else {
      const emailToken = await this.createEmailTokenUseCase.execute(email)
      await this.sendEmailTokenUseCase.execute(emailToken)
      res.body = { message: 'Token sent' }
      res.status = 200
    }
  }
}
