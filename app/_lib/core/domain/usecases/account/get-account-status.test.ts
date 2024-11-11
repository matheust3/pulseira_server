import { MockProxy, mock } from 'jest-mock-extended'
import { AccountRepository } from '../../../application/gateways/account-repository'
import { JwtService } from '../../../application/gateways/jwt-service'
import { GetAccountStatus } from './get-account-status'
import { AccountStatus } from '../../models/account-status'

describe('get-account-status.test.ts - execute', () => {
  let jwtService: MockProxy<JwtService>
  let accountRepository: MockProxy<AccountRepository>
  let sut: GetAccountStatus
  let accountStatus: AccountStatus

  beforeEach(() => {
    jwtService = mock<JwtService>()
    jwtService.validateToken.mockResolvedValue({ tokenId: 'any_token_id' })
    accountRepository = mock<AccountRepository>()

    accountStatus = {
      basicInformation: false,
      description: false,
      profileImage: false,
    }

    sut = new GetAccountStatus({
      accountRepository,
      jwtService,
    })
  })

  test('ensure decrypt token', async () => {
    //! Arrange
    const token = 'any_token'
    //! Act
    await sut.execute(token)
    //! Assert
    expect(jwtService.validateToken).toHaveBeenCalledWith(token)
  })

  test('should call getAccountStatus with correct tokenId', async () => {
    //! Arrange
    const token = 'any_token'
    //! Act
    await sut.execute(token)
    //! Assert
    expect(accountRepository.getAccountStatus).toHaveBeenCalledWith(
      'any_token_id',
    )
  })

  test('should return account status', async () => {
    //! Arrange
    const token = 'any token'
    accountRepository.getAccountStatus.mockResolvedValue(accountStatus)
    //! Act
    const result = await sut.execute(token)
    //! Assert
    expect(result).toBe(accountStatus)
  })
})
