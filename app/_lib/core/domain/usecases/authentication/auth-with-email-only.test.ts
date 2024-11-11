import { MockProxy, mock } from 'jest-mock-extended'
import { AuthWithEmailOnly } from './auth-with-email-only'
import { JwtService } from '../../../application/gateways/jwt-service'
import { EmailTokenRepository } from '../../../application/gateways/email-token-repository'
import { EmailToken } from '../../models/email-token'
import { AuthEmailPayload } from '../../models/authentication/auth-email-payload'
import { UserRepository } from '../../../application/gateways/user-repository'
import { User } from '../../models/user'

describe('auth-with-email-only.test.ts - execute', () => {
  let sut: AuthWithEmailOnly
  let jwtService: MockProxy<JwtService>
  let emailTokenRepository: MockProxy<EmailTokenRepository>
  let userRepository: MockProxy<UserRepository>

  beforeEach(() => {
    process.env.JWT_SECRET = 'any_secret'
    jwtService = mock<JwtService>()
    emailTokenRepository = mock<EmailTokenRepository>()
    userRepository = mock<UserRepository>()

    userRepository.getUserByEmail.mockResolvedValue(
      mock<User>({ id: 'any_user_id' }),
    )

    sut = new AuthWithEmailOnly({
      emailTokenRepository,
      jwtService,
      userRepository,
    })
  })

  test('ensure return new token if token is valid and has a userId', async () => {
    //! Arrange
    const payload: AuthEmailPayload = {
      tokenId: 'valid_token_id',
      token: 'valid_token',
      nExp: Date.now() + 1000 * 60 * 30,
      userId: 'any_id',
    }
    jwtService.validateToken.mockResolvedValue(payload)
    //! Act
    const result = await sut.execute('original token')
    //! Assert
    expect(result).toEqual('original token')
    expect(emailTokenRepository.findTokenById).not.toHaveBeenCalled()
  })

  test('ensure call findTokenById if token.nExp is undefined', async () => {
    //! Arrange
    jwtService.validateToken.mockResolvedValue({
      tokenId: 'valid_token_id',
      token: 'valid_token',
    })
    jwtService.generateToken.mockResolvedValue('valid_token')
    emailTokenRepository.findTokenById.mockResolvedValue(
      mock<EmailToken>({ id: 'valid_token_id', token: 'valid_token' }),
    )
    //! Act
    await sut.execute('valid_token')
    //! Assert
    expect(emailTokenRepository.findTokenById).toHaveBeenCalledWith(
      'valid_token_id',
    )
  })

  test('ensure call getUserByEmail if token.userId is undefined', async () => {
    //! Arrange
    jwtService.validateToken.mockResolvedValue({
      tokenId: 'valid_token_id',
      token: 'valid_token',
      nExp: Date.now() + 1000 * 60 * 31,
    })
    jwtService.generateToken.mockImplementation(async (v) => JSON.stringify(v))
    emailTokenRepository.findTokenById.mockResolvedValue(
      mock<EmailToken>({
        id: 'valid_token_id',
        token: 'valid_token',
        email: 'any_email',
      }),
    )
    //! Act
    const result = await sut.execute('valid_token')
    const newToken = JSON.parse(result)
    //! Assert
    expect(emailTokenRepository.findTokenById).toHaveBeenCalledWith(
      'valid_token_id',
    )
    expect(userRepository.getUserByEmail).toHaveBeenCalledWith('any_email')
    expect(newToken.userId).toEqual('any_user_id')
  })

  test('ensure return token.userId undefined if user not found', async () => {
    //! Arrange
    jwtService.validateToken.mockResolvedValue({
      tokenId: 'valid_token_id',
      token: 'valid_token',
      nExp: Date.now() + 1000 * 60 * 31,
    })
    jwtService.generateToken.mockImplementation(async (v) => JSON.stringify(v))
    emailTokenRepository.findTokenById.mockResolvedValue(
      mock<EmailToken>({
        id: 'valid_token_id',
        token: 'valid_token',
        email: 'any_email',
      }),
    )
    userRepository.getUserByEmail.mockResolvedValue(null)
    //! Act
    const result = await sut.execute('valid_token')
    const newToken = JSON.parse(result)
    //! Assert
    expect(newToken.userId).toBeUndefined()
  })

  test('ensure call findTokenById if token.nExp expired and generate new token', async () => {
    //! Arrange
    jwtService.validateToken.mockResolvedValue({
      tokenId: 'valid_token_id',
      token: 'valid_token',
      nExp: Date.now() - 1000 * 60 * 31,
    })
    jwtService.generateToken.mockResolvedValue('valid_token')
    emailTokenRepository.findTokenById.mockResolvedValue(
      mock<EmailToken>({ id: 'valid_token_id', token: 'valid_token' }),
    )
    //! Act
    const result = await sut.execute('expired_token')
    //! Assert
    expect(result).toEqual('valid_token')
  })

  test('ensure call findTokenById if token.nExp expired', async () => {
    //! Arrange
    jwtService.validateToken.mockResolvedValue({
      tokenId: 'valid_token_id',
      token: 'valid_token',
      nExp: Date.now() - 1000 * 60 * 31,
    })
    jwtService.generateToken.mockResolvedValue('valid_token')
    emailTokenRepository.findTokenById.mockResolvedValue(
      mock<EmailToken>({ id: 'valid_token_id', token: 'valid_token' }),
    )
    //! Act
    await sut.execute('valid_token')
    //! Assert
    expect(emailTokenRepository.findTokenById).toHaveBeenCalledWith(
      'valid_token_id',
    )
  })

  test('ensure throws if token not found', async () => {
    //! Arrange
    jwtService.validateToken.mockResolvedValue({
      tokenId: 'valid_token_id',
      token: 'invalid_token',
      nExp: Date.now() - 1000 * 60 * 31,
    })
    emailTokenRepository.findTokenById.mockResolvedValue(null)
    //! Act
    //! Assert
    expect(sut.execute('invalid_token')).rejects.toThrow('Invalid token')
  })

  test('ensure throw error if token is invalid', async () => {
    //! Arrange
    jwtService.validateToken.mockImplementation(() => {
      throw new Error('Invalid token')
    })
    //! Act
    const result = sut.execute('invalid_token')
    //! Assert
    await expect(result).rejects.toThrow('Invalid token')
  })

  test('ensure return new token correctly', async () => {
    //! Arrange
    const payload: AuthEmailPayload = {
      token: 'valid_token',
      tokenId: 'valid_token_id',
    }
    jwtService.validateToken.mockResolvedValue(payload)
    const emailToken: EmailToken = {
      createdAt: 'any_date',
      id: 'valid_token_id',
      token: 'valid_token',
      email: 'any_email',
      updatedAt: 'any_date',
      verified: false,
    }
    emailTokenRepository.findTokenById.mockResolvedValue(emailToken)
    jwtService.generateToken.mockImplementation(async (v) => JSON.stringify(v))
    // Mock Date.now
    const dateNow = jest.spyOn(Date, 'now').mockReturnValue(1)
    //! Act
    const result = await sut.execute('valid_token')
    //! Assert
    expect(result).toEqual(
      JSON.stringify({
        ...payload,
        nExp: 1 + 1000 * 60 * 30,
        userId: 'any_user_id',
      }),
    )
    dateNow.mockRestore()
  })
})
