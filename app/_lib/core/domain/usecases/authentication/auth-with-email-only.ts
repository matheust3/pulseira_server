import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'
import { JwtService } from '../../../application/gateways/jwt-service'
import { UserRepository } from '../../../application/gateways/user-repository'
import { AuthEmailPayload } from '../../models/authentication/auth-email-payload'

/**
 * Authenticate a user with an email only
 * Limited to the email only authentication
 */
export class AuthWithEmailOnly {
  private readonly jwtService: JwtService
  private readonly emailTokenRepository: EmailTokenRepository
  private readonly userRepository: UserRepository

  constructor(args: {
    jwtService: JwtService
    emailTokenRepository: EmailTokenRepository
    userRepository: UserRepository
  }) {
    this.jwtService = args.jwtService
    this.emailTokenRepository = args.emailTokenRepository
    this.userRepository = args.userRepository
  }

  async execute(token: string): Promise<string> {
    try {
      const payload = (await this.jwtService.validateToken(
        token,
      )) as AuthEmailPayload
      if (
        payload.nExp === undefined ||
        payload.nExp < Date.now() ||
        payload.userId === undefined
      ) {
        const token = await this.emailTokenRepository.findTokenById(
          payload.tokenId,
        )
        if (token === null || token.token !== payload.token) {
          throw new Error('Invalid token')
        } else {
          // Verifica se existe um usuário com o email do token
          const user = await this.userRepository.getUserByEmail(token.email)
          const newToken: AuthEmailPayload = {
            token: token.token,
            tokenId: token.id,
            nExp: Date.now() + 1000 * 60 * 30,
            userId: user?.id,
          }
          return await this.jwtService.generateToken(newToken, '60d')
        }
      } else {
        return token
      }
    } catch (error) {
      throw new Error('Invalid token')
    }
  }
}
