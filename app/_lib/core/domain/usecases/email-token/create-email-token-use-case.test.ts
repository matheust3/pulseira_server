import { MockProxy, mock } from 'jest-mock-extended'
import { CreateEmailTokenUseCase } from './create-email-token-use-case'
import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'

describe('create-email-token-use-case.test.ts - execute', () => {
  let sut: CreateEmailTokenUseCase
  let emailTokenRepositorySpy: MockProxy<EmailTokenRepository>

  beforeEach(() => {
    emailTokenRepositorySpy = mock<EmailTokenRepository>()
    emailTokenRepositorySpy.createEmailToken.mockImplementation(
      (email, token) =>
        Promise.resolve({
          createdAt: 'any_date',
          email,
          verified: false,
          token,
          id: 'any_id',
          updatedAt: 'any_date',
        }),
    )
    sut = new CreateEmailTokenUseCase(emailTokenRepositorySpy)
  })

  test('ensure return token with 6 characters uppercase alphanumeric', async () => {
    //! Arrange
    //! Act
    const result = await sut.execute('any_email')
    //! Assert
    expect(result.token).toHaveLength(6)
    expect(result.token).toMatch(/^[A-Z0-9]+$/)
  })

  test('ensure call repository witch correct params', async () => {
    //! Arrange
    //! Act
    await sut.execute('any_email')
    //! Assert
    expect(emailTokenRepositorySpy.createEmailToken).toHaveBeenCalledWith(
      'any_email',
      expect.stringMatching(/^[A-Z0-9]{6}$/),
    )
  })
})
