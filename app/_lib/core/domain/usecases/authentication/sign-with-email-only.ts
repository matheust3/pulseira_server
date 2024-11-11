import { JwtService } from '../../../application/gateways/jwt-service'

export class SignWithEmailOnly {
  private readonly jwtService: JwtService

  constructor(jwtService: JwtService) {
    this.jwtService = jwtService
  }

  /**
   * Sign with email only
   * @param emailTokenId The email token id
   * @returns The signed token
   */
  public async execute(emailTokenId: string, token: string): Promise<string> {
    return await this.jwtService.generateToken(
      { tokenId: emailTokenId, token },
      '60d',
    )
  }
}
