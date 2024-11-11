import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { EmailTokenRepositoryImpl } from './email-token-repository-impl'
import { PrismaClient } from '@prisma/client'

describe('email-token-repository-impl.test.ts - createEmailToken', () => {
  let sut: EmailTokenRepositoryImpl
  let prismaClientSpy: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    prismaClientSpy = mockDeep<PrismaClient>()
    sut = new EmailTokenRepositoryImpl(prismaClientSpy)
  })

  test('ensure call prisma witch correct params', async () => {
    //! Arrange
    prismaClientSpy.emailToken.upsert.mockResolvedValueOnce({
      id: 'any_id',
      email: 'any_email',
      verified: false,
      token: 'any_token',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    //! Act
    await sut.createEmailToken('any_email', 'any_token')
    //! Assert
    expect(prismaClientSpy.emailToken.upsert).toHaveBeenCalledWith({
      create: {
        email: 'any_email',
        token: 'any_token',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        id: expect.any(String),
      },
      update: {
        email: 'any_email',
        token: 'any_token',
        verified: false,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
      where: { email: 'any_email' },
    })
  })

  test('ensure throws if prisma throws', async () => {
    //! Arrange
    prismaClientSpy.emailToken.upsert.mockRejectedValueOnce(new Error())
    //! Act
    //! Assert
    expect(sut.createEmailToken('any_email', 'any_token')).rejects.toThrow()
  })

  test('ensure copy id if update token', async () => {
    //! Arrange
    prismaClientSpy.emailToken.upsert.mockResolvedValueOnce({
      id: 'another_id',
      email: 'any_email',
      token: 'any_token',
      verified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    //! Act
    const result = await sut.createEmailToken('any_email', 'any_token')
    //! Assert
    expect(result.id).toBe('another_id')
    expect(result.email).toBe('any_email')
    expect(result.token).toBe('any_token')
  })
})

describe('email-token-repository-impl.test.ts - findEmailToken', () => {
  let sut: EmailTokenRepositoryImpl
  let prismaClientSpy: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    prismaClientSpy = mockDeep<PrismaClient>()
    sut = new EmailTokenRepositoryImpl(prismaClientSpy)
  })

  test('ensure call prisma witch correct params', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockResolvedValueOnce({
      id: 'any_id',
      email: 'any_email',
      verified: false,
      token: 'any_token',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    //! Act
    await sut.findEmailToken('any_email', 'any_token')
    //! Assert
    expect(prismaClientSpy.emailToken.findFirst).toHaveBeenCalledWith({
      where: { token: 'any_token', email: 'any_email' },
    })
  })

  test('ensure return null if prisma return null', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockResolvedValueOnce(null)
    //! Act
    const result = await sut.findEmailToken('any_email', 'any_token')
    //! Assert
    expect(result).toBeNull()
  })

  test('ensure return a EmailTokenEntity if prisma return a EmailTokenEntity', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockResolvedValueOnce({
      id: 'any_id',
      email: 'any_email',
      verified: false,
      token: 'any_token',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    //! Act
    const result = await sut.findEmailToken('any_email', 'any_token')
    //! Assert
    expect(result).toEqual({
      id: 'any_id',
      email: 'any_email',
      verified: false,
      token: 'any_token',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  test('ensure throws if prisma throws', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockRejectedValueOnce(new Error())
    //! Act
    //! Assert
    expect(sut.findEmailToken('any_email', 'any_token')).rejects.toThrow()
  })
})

describe('email-token-repository-impl.test.ts - setAsVerified', () => {
  let sut: EmailTokenRepositoryImpl
  let prismaClientSpy: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    prismaClientSpy = mockDeep<PrismaClient>()
    sut = new EmailTokenRepositoryImpl(prismaClientSpy)
  })

  test('ensure call prisma witch correct params', async () => {
    //! Arrange
    //! Act
    await sut.setAsVerified('any_id')
    //! Assert
    expect(prismaClientSpy.emailToken.update).toHaveBeenCalledWith({
      where: { id: 'any_id' },
      data: { verified: true },
    })
  })

  test('ensure throws if prisma throws', async () => {
    //! Arrange
    prismaClientSpy.emailToken.update.mockRejectedValueOnce(new Error())
    //! Act
    //! Assert
    expect(sut.setAsVerified('any_id')).rejects.toThrow()
  })
})

describe('email-token-repository-impl.test.ts - findTokenById', () => {
  let sut: EmailTokenRepositoryImpl
  let prismaClientSpy: DeepMockProxy<PrismaClient>

  beforeEach(() => {
    prismaClientSpy = mockDeep<PrismaClient>()
    sut = new EmailTokenRepositoryImpl(prismaClientSpy)
  })

  test('ensure call prisma witch correct params', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockResolvedValueOnce({
      id: 'any_id',
      email: 'any_email',
      verified: false,
      token: 'any_token',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    //! Act
    await sut.findTokenById('any_id')
    //! Assert
    expect(prismaClientSpy.emailToken.findFirst).toHaveBeenCalledWith({
      where: { id: 'any_id' },
    })
  })

  test('ensure return null if prisma return null', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockResolvedValueOnce(null)
    //! Act
    const result = await sut.findTokenById('any_id')
    //! Assert
    expect(result).toBeNull()
  })

  test('ensure return a EmailTokenEntity if prisma return a EmailTokenEntity', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockResolvedValueOnce({
      id: 'any_id',
      email: 'any_email',
      verified: false,
      token: 'any_token',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    //! Act
    const result = await sut.findTokenById('any_id')
    //! Assert
    expect(result).toEqual({
      id: 'any_id',
      email: 'any_email',
      verified: false,
      token: 'any_token',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })

  test('ensure throws if prisma throws', async () => {
    //! Arrange
    prismaClientSpy.emailToken.findFirst.mockRejectedValueOnce(new Error())
    //! Act
    //! Assert
    expect(sut.findTokenById('any_id')).rejects.toThrow()
  })
})
