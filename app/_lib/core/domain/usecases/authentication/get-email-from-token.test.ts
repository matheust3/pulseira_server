import { mock, MockProxy } from 'jest-mock-extended'
import { JwtService } from '../../../application/gateways/jwt-service'
import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'
import { GetEmailFromToken } from './get-email-from-token'
import { AuthEmailPayload } from '../../models/authentication/auth-email-payload'
import { EmailToken } from '../../models/email-token'

describe('get-email-from-token.test.ts - execute', () => {
  let jwtService: MockProxy<JwtService>
  let emailTokenRepository: MockProxy<EmailTokenRepository>
  let authEmailPayload: MockProxy<AuthEmailPayload>
  let emailToken: MockProxy<EmailToken>
  let sut: GetEmailFromToken

  beforeEach(() => {
    jwtService = mock<JwtService>()
    emailTokenRepository = mock<EmailTokenRepository>()
    authEmailPayload = mock<AuthEmailPayload>()
    emailToken = mock<EmailToken>({ email: 'any_email' })

    jwtService.validateToken.mockResolvedValue(authEmailPayload)
    emailTokenRepository.findTokenById.mockResolvedValue(emailToken)

    sut = new GetEmailFromToken({
      jwtService,
      emailTokenRepository,
    })
  })

  test('ensure get token payload ', async () => {
    //! Arrange
    //! Act
    await sut.execute('token')
    //! Assert
    expect(jwtService.validateToken).toHaveBeenCalledWith('token')
  })

  test('ensure get email from token ', async () => {
    //! Arrange
    //! Act
    const email = await sut.execute('token')
    //! Assert
    expect(email).toBe('any_email')
  })

  test('ensure throw error if token is invalid ', async () => {
    //! Arrange
    jwtService.validateToken.mockRejectedValueOnce(new Error('invalid token'))
    //! Act
    const promise = sut.execute('token')
    //! Assert
    await expect(promise).rejects.toThrow('invalid token')
  })

  test('ensure throw error if email token is not found ', async () => {
    //! Arrange
    emailTokenRepository.findTokenById.mockResolvedValueOnce(null)
    //! Act
    const promise = sut.execute('token')
    //! Assert
    await expect(promise).rejects.toThrow('invalid token')
  })
})
