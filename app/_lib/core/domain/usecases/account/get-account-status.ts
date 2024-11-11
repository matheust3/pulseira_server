import { AccountRepository } from '../../../application/gateways/account-repository'
import { JwtService } from '../../../application/gateways/jwt-service'
import { AccountStatus } from '../../models/account-status'

export class GetAccountStatus {
  private readonly accountRepository: AccountRepository
  private readonly jwtService: JwtService

  constructor(args: {
    accountRepository: AccountRepository
    jwtService: JwtService
  }) {
    this.accountRepository = args.accountRepository
    this.jwtService = args.jwtService
  }

  async execute(token: string): Promise<AccountStatus> {
    const payload = (await this.jwtService.validateToken(token)) as {
      tokenId: string
    }
    return this.accountRepository.getAccountStatus(payload.tokenId)
  }
}
