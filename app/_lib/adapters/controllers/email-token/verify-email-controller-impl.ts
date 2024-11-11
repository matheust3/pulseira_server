import { VerifyEmailController } from '@/app/_lib/core/application/controllers/email-token/verify-email-controller'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { SignWithEmailOnly } from '@/app/_lib/core/domain/usecases/authentication/sign-with-email-only'
import { VerifyEmailTokenUseCase } from '@/app/_lib/core/domain/usecases/email-token/verify-email-token-use-case'
import { Request } from '@/app/_lib/core/domain/models/routes/request'

export class VerifyEmailControllerImpl implements VerifyEmailController {
  private readonly verifyEmailTokenUseCase: VerifyEmailTokenUseCase
  private readonly signWithEmailOnly: SignWithEmailOnly

  constructor(args: {
    verifyEmailTokenUseCase: VerifyEmailTokenUseCase
    signWithEmailOnly: SignWithEmailOnly
  }) {
    this.verifyEmailTokenUseCase = args.verifyEmailTokenUseCase
    this.signWithEmailOnly = args.signWithEmailOnly
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    let json: { email?: string; token?: string } = {}

    try {
      json = (await req.json()) as typeof json
    } catch (error) {
      res.body = { error: 'A json is required' }
      res.status = 400
      return
    }
    const { email, token } = json
    if (email === undefined) {
      res.body = { error: 'Email is required' }
      res.status = 400
    } else if (token === undefined) {
      res.body = { error: 'Token is required' }
      res.status = 400
    } else {
      const emailToken = await this.verifyEmailTokenUseCase.execute(
        email,
        token,
      )
      if (emailToken === null) {
        res.body = { error: 'Invalid token' }
        res.status = 400
      } else {
        const token = await this.signWithEmailOnly.execute(
          emailToken.id,
          emailToken.token,
        )
        res.body = { token }
        res.status = 200
      }
    }
  }
}
