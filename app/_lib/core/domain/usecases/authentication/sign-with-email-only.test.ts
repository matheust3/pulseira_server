import { MockProxy, mock } from 'jest-mock-extended'
import { SignWithEmailOnly } from './sign-with-email-only'
import { JwtService } from '../../../application/gateways/jwt-service'

describe('sign-with-email-only.test.ts - execute', () => {
  let sut: SignWithEmailOnly
  let jwtService: MockProxy<JwtService>

  beforeEach(() => {
    jwtService = mock<JwtService>()

    sut = new SignWithEmailOnly(jwtService)
  })

  test('ensure return a signed token', async () => {
    //! Arrange
    jwtService.generateToken.mockResolvedValue('any_token')
    //! Act
    const token = await sut.execute('any_email_token', 'token')
    //! Assert
    expect(token).toBe('any_token')
  })
})
