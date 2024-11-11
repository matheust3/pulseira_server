import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'
import { JwtService } from '../../../application/gateways/jwt-service'
import { AuthEmailPayload } from '../../models/authentication/auth-email-payload'

export class GetEmailFromToken {
  private readonly jwtService: JwtService
  private readonly emailTokenRepository: EmailTokenRepository

  constructor(args: {
    jwtService: JwtService
    emailTokenRepository: EmailTokenRepository
  }) {
    this.jwtService = args.jwtService
    this.emailTokenRepository = args.emailTokenRepository
  }

  async execute(token: string): Promise<string> {
    const payload = (await this.jwtService.validateToken(
      token,
    )) as AuthEmailPayload
    const emailToken = await this.emailTokenRepository.findTokenById(
      payload.tokenId,
    )
    if (emailToken === null) {
      throw new Error('invalid token')
    } else {
      return emailToken.email
    }
  }
}
