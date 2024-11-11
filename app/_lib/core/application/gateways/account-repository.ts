import { AccountStatus } from '../../domain/models/account-status'

export interface AccountRepository {
  getAccountStatus: (tokenId: string) => Promise<AccountStatus>
}
