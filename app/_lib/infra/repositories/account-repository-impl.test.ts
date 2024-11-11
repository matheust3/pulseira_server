import {
  Description,
  EmailToken,
  Image,
  PrismaClient,
  User as PrismaUser,
} from '@prisma/client'
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { AccountRepositoryImpl } from './account-repository-impl'

describe('account-repository-impl.test.ts - getAccountStatus', () => {
  let prismaClient: DeepMockProxy<PrismaClient>
  let sut: AccountRepositoryImpl

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>()
    prismaClient.user.findUnique.mockResolvedValue(
      mock<PrismaUser & { images: Array<MockProxy<Image>> }>({
        images: [],
      }),
    )
    prismaClient.emailToken.findUnique.mockResolvedValue(mock<EmailToken>())

    sut = new AccountRepositoryImpl({ prismaClient })
  })

  test('should return basicInformation true if user exists', async () => {
    //! Arrange
    const user = mock<PrismaUser>()
    prismaClient.user.findUnique.mockResolvedValue(user)
    //! Act
    const result = await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(result.basicInformation).toBe(true)
  })

  test('should return basicInformation false if user does not exists', async () => {
    //! Arrange
    prismaClient.user.findUnique.mockResolvedValue(null)
    //! Act
    const result = await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(result.basicInformation).toBe(false)
  })

  test('should call prismaClient with correct values', async () => {
    //! Arrange
    const email = 'any_email'
    prismaClient.emailToken.findUnique.mockResolvedValue(
      mock<EmailToken>({ email }),
    )
    //! Act
    await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(prismaClient.user.findUnique).toHaveBeenCalledWith({
      where: {
        email,
      },
      include: { description: true, images: true },
    })
  })

  test('should throw if prismaClient throws', async () => {
    //! Arrange
    prismaClient.user.findUnique.mockRejectedValue(new Error())
    //! Act
    const promise = sut.getAccountStatus('any_token_id')
    //! Assert
    await expect(promise).rejects.toThrow()
  })

  test('should return basicInformation false if token does not exists', async () => {
    //! Arrange
    prismaClient.emailToken.findUnique.mockResolvedValue(null)
    //! Act
    const result = await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(result.basicInformation).toBe(false)
  })

  test('should return description true if user has description', async () => {
    //! Arrange
    const user = mock<PrismaUser & { description: Description }>({
      description: mock<Description>(),
    })

    prismaClient.user.findUnique.mockResolvedValue(user)
    //! Act
    const result = await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(result.description).toBe(true)
  })

  test('should return description false if user does not have description', async () => {
    //! Arrange
    const user = mock<PrismaUser & { description: null }>({
      description: null,
    })

    prismaClient.user.findUnique.mockResolvedValue(user)
    //! Act
    const result = await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(result.description).toBe(false)
  })

  test('should return profileImage true if user has profile image', async () => {
    //! Arrange
    const user = mock<PrismaUser & { images: Array<MockProxy<Image>> }>({
      images: [mock<Image>({ flag: 'profile' })],
    })

    prismaClient.user.findUnique.mockResolvedValue(user)
    //! Act
    const result = await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(result.profileImage).toBe(true)
  })

  test('should return profileImage false if user does not have profile image', async () => {
    //! Arrange
    const user = mock<PrismaUser & { images: Array<MockProxy<Image>> }>({
      images: [],
    })

    prismaClient.user.findUnique.mockResolvedValue(user)
    //! Act
    const result = await sut.getAccountStatus('any_token_id')
    //! Assert
    expect(result.profileImage).toBe(false)
  })
})
