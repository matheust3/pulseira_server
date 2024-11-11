import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'
import { EmailToken } from '../../models/email-token'

export class VerifyEmailTokenUseCase {
  private readonly emailTokenRepository: EmailTokenRepository

  constructor(emailTokenRepository: EmailTokenRepository) {
    this.emailTokenRepository = emailTokenRepository
  }

  async execute(email: string, token: string): Promise<EmailToken | null> {
    const result = await this.emailTokenRepository.findEmailToken(email, token)
    if (
      result !== null &&
      !result.verified &&
      new Date(result.createdAt) >
        new Date(new Date().getTime() - 1000 * 60 * 30)
    ) {
      await this.emailTokenRepository.setAsVerified(result.id)
      return result
    } else {
      return null
    }
  }
}
