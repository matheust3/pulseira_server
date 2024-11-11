import { MockProxy, mock } from 'jest-mock-extended'
import { VerifyEmailTokenUseCase } from './verify-email-token-use-case'
import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'
import { EmailToken } from '../../models/email-token'

describe('verify-email-token-use-case.test.ts - execute', () => {
  let sut: VerifyEmailTokenUseCase
  let emailTokenRepositorySpy: MockProxy<EmailTokenRepository>
  let emailTokenEntity: MockProxy<EmailToken>

  beforeEach(() => {
    emailTokenEntity = mock<EmailToken>()
    emailTokenEntity.createdAt = new Date().toISOString()
    emailTokenRepositorySpy = mock<EmailTokenRepository>()
    emailTokenRepositorySpy.findEmailToken.mockResolvedValue(emailTokenEntity)
    sut = new VerifyEmailTokenUseCase(emailTokenRepositorySpy)
  })

  test('ensure return email token if exists and verified is false', async () => {
    //! Arrange
    emailTokenEntity.verified = false
    //! Act
    const result = await sut.execute('any_email', 'any_token')
    //! Assert
    expect(result).toBe(emailTokenEntity)
  })

  test('ensure return null if exists and verified is false but createdAt is older than 30 minutes', async () => {
    //! Arrange
    emailTokenEntity.verified = false
    emailTokenEntity.createdAt = new Date(
      new Date().getTime() - 1000 * 60 * 31,
    ).toISOString()
    //! Act
    const result = await sut.execute('any_email', 'any_token')
    //! Assert
    expect(result).toBe(null)
  })

  test('ensure call setAsVerified if exists and verified is false', async () => {
    //! Arrange
    emailTokenEntity.verified = false
    //! Act
    await sut.execute('any_email', 'any_token')
    //! Assert
    expect(emailTokenRepositorySpy.setAsVerified).toHaveBeenCalledWith(
      emailTokenEntity.id,
    )
  })

  test('ensure return null if exists but verified is true', async () => {
    //! Arrange
    emailTokenEntity.verified = true
    //! Act
    const result = await sut.execute('any_email', 'any_token')
    //! Assert
    expect(result).toBe(null)
  })

  test('ensure return null if email token not exists', async () => {
    //! Arrange
    emailTokenRepositorySpy.findEmailToken.mockResolvedValue(null)
    //! Act
    const result = await sut.execute('any_email', 'any_token')
    //! Assert
    expect(result).toBeNull()
  })

  test('should call findEmailToken with correct values', async () => {
    //! Arrange
    //! Act
    await sut.execute('any_email', 'any_token')
    //! Assert
    expect(emailTokenRepositorySpy.findEmailToken).toHaveBeenCalledWith(
      'any_email',
      'any_token',
    )
  })

  test('should throw if findEmailToken throws', async () => {
    //! Arrange
    emailTokenRepositorySpy.findEmailToken.mockRejectedValueOnce(new Error())
    //! Act
    const promise = sut.execute('any_email', 'any_token')
    //! Assert
    await expect(promise).rejects.toThrow()
  })
})
