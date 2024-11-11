import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'
import { EmailToken } from '../../models/email-token'

export class CreateEmailTokenUseCase {
  private readonly emailTokenRepository: EmailTokenRepository

  constructor(emailTokenRepository: EmailTokenRepository) {
    this.emailTokenRepository = emailTokenRepository
  }

  async execute(email: string): Promise<EmailToken> {
    // Token is a random alphanumeric uppercase string with 6 characters
    const token = Math.random().toString(36).substring(2, 8).toUpperCase()

    return this.emailTokenRepository.createEmailToken(email, token)
  }
}
