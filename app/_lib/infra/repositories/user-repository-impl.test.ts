import {
  PrismaClient,
  User as PrismaUser,
  Image as PrismaImage,
  Description,
} from '@prisma/client'
import { MockProxy, DeepMockProxy, mockDeep, mock } from 'jest-mock-extended'
import { UserRepositoryImpl } from './user-repository-impl'
import { User } from '../../core/domain/models/user'
import { ImageRepository } from '../../core/application/gateways/image-repository'

describe('user-repository-impl.test.ts - create', () => {
  let prisma: DeepMockProxy<PrismaClient>
  let sut: UserRepositoryImpl
  let user: MockProxy<User>

  beforeEach(() => {
    user = mock<User>({ id: '' })
    prisma = mockDeep<PrismaClient>()
    prisma.user.create.mockResolvedValue({
      email: 'any email',
      name: 'any name',
      birthdate: new Date(),
      gender: 'any gender',
      genderInterest: 'any gender interest',
      id: 'any id',
      createdAt: new Date(),
      updatedAt: new Date(),
      searchDistance: 100,
    })
    sut = new UserRepositoryImpl({
      prisma,
      imageRepository: mock<ImageRepository>(),
    })
  })

  test('ensure call prisma with correct params', async () => {
    //! Arrange
    //! Act
    await sut.create(user)
    //! Assert
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: user.email,
        name: user.name,
        birthdate: user.birthdate,
        gender: user.gender,
        genderInterest: user.genderInterest,
        searchDistance: user.searchDistance,
      },
    })
  })

  test('ensure return correct user', async () => {
    //! Arrange
    //! Act
    const result = await sut.create(user)
    //! Assert
    expect(result).toEqual({
      id: 'any id',
      email: 'any email',
      name: 'any name',
      birthdate: expect.any(Date),
      gender: 'any gender',
      genderInterest: 'any gender interest',
      description: '',
      images: [],
      searchDistance: 100,
    })
  })

  test('ensure throw if prisma throws', async () => {
    //! Arrange
    prisma.user.create.mockRejectedValueOnce(new Error('any error'))
    //! Act
    const promise = sut.create(user)
    //! Assert
    await expect(promise).rejects.toThrow(new Error('any error'))
  })
})

describe('user-repository-impl.test.ts - getUserById', () => {
  let prisma: DeepMockProxy<PrismaClient>
  let user: User
  let imageRepository: MockProxy<ImageRepository>
  let sut: UserRepositoryImpl

  beforeEach(() => {
    user = {
      id: 'any id',
      email: 'any email',
      name: 'any name',
      birthdate: new Date(),
      gender: 'male',
      genderInterest: 'female',
      description: 'any description',
      searchDistance: 100,
      images: [
        {
          id: 'profile image id',
          orderId: 0,
          userId: 'any id',
          flag: 'profile',
          url: 'profile image key signed url',
        },
      ],
    }
    imageRepository = mock<ImageRepository>()
    imageRepository.getImageUrlByFileKey.mockImplementation((fileKey) =>
      Promise.resolve(`${fileKey} signed url`),
    )

    prisma = mockDeep<PrismaClient>()
    prisma.user.findUnique.mockResolvedValue(
      mock<PrismaUser & { images: PrismaImage[]; description: Description }>({
        id: user.id,
        email: user.email,
        name: user.name,
        birthdate: user.birthdate,
        gender: user.gender,
        genderInterest: user.genderInterest,
        searchDistance: user.searchDistance,
        description: {
          content: user.description,
        },
        images: [
          mock<PrismaImage>({
            id: 'profile image id',
            userId: user.id,
            orderId: 0,
            flag: 'profile',
            fileKey: 'profile image key',
          }),
          mock<PrismaImage>({
            id: 'id image id',
            orderId: 0,
            userId: user.id,
            flag: 'id',
            fileKey: 'id image key',
          }),
        ],
      }),
    )

    sut = new UserRepositoryImpl({
      prisma,
      imageRepository,
    })
  })

  test('ensure return correct user', async () => {
    //! Arrange
    //! Act
    const result = await sut.getUserById('any id')
    //! Assert
    expect({ ...result, birthdate: result?.birthdate.toJSON() }).toEqual({
      ...user,
      birthdate: user.birthdate.toJSON(),
    })
  })

  test('ensure return without images with flag different from profile', async () => {
    //! Arrange
    prisma.user.findUnique.mockResolvedValue(
      mock<PrismaUser & { images: PrismaImage[]; description: Description }>({
        id: user.id,
        email: user.email,
        name: user.name,
        birthdate: user.birthdate,
        gender: user.gender,
        genderInterest: user.genderInterest,
        searchDistance: user.searchDistance,
        description: {
          content: user.description,
        },
        images: [
          mock<PrismaImage>({
            id: 'profile image id',
            userId: user.id,
            flag: 'profile',
            fileKey: 'profile image key',
          }),
          mock<PrismaImage>({
            id: 'id image id',
            userId: user.id,
            flag: 'id',
            fileKey: 'id image key',
          }),
        ],
      }),
    )
    //! Act
    const result = await sut.getUserById('any id')
    //! Assert
    expect(result?.images).toHaveLength(1)
    expect(result?.images?.[0].flag).toEqual('profile')
  })

  test('ensure return null if user not exists', async () => {
    //! Arrange
    prisma.user.findUnique.mockResolvedValue(null)
    //! Act
    const result = await sut.getUserById('any id')
    //! Assert
    expect(result).toBeNull()
  })

  test('ensure call prisma with correct params', async () => {
    //! Arrange
    //! Act
    await sut.getUserById('any id')
    //! Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'any id' },
      include: { description: true, images: true },
    })
  })

  test('ensure call imageRepository with correct params', async () => {
    //! Arrange
    //! Act
    await sut.getUserById('any id')
    //! Assert
    expect(imageRepository.getImageUrlByFileKey).toHaveBeenCalledWith(
      'profile image key',
    )
  })
})

describe('user-repository-impl.test.ts - getUserByEmail', () => {
  let prisma: DeepMockProxy<PrismaClient>
  let sut: UserRepositoryImpl
  let prismaUser: MockProxy<
    PrismaUser & { images: PrismaImage[]; description: Description }
  >

  beforeEach(() => {
    prismaUser = mock<
      PrismaUser & { images: PrismaImage[]; description: Description }
    >({
      id: 'userId',
      email: 'any',
      name: 'any',
      gender: 'any',
      genderInterest: 'any',
      searchDistance: 100,
      birthdate: new Date('1990-01-01'),
      description: mock<Description>({ content: 'any description' }),
      images: [],
    })
    prisma = mockDeep<PrismaClient>()
    prisma.user.findUnique.mockResolvedValue(prismaUser)
    sut = new UserRepositoryImpl({
      prisma,
      imageRepository: mock<ImageRepository>(),
    })
  })

  test('ensure return null if user not exists', async () => {
    //! Arrange
    prisma.user.findUnique.mockResolvedValue(null)
    //! Act
    const result = await sut.getUserByEmail('any email')
    //! Assert
    expect(result).toBeNull()
  })

  test('ensure call prisma with correct params', async () => {
    //! Arrange
    //! Act
    await sut.getUserByEmail('any email')
    //! Assert
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'any email' },
      include: { description: true, images: true },
    })
  })

  test('ensure return correct user', async () => {
    //! Arrange
    const user: User = {
      birthdate: prismaUser.birthdate,
      description: prismaUser.description.content,
      email: prismaUser.email,
      gender: prismaUser.gender,
      genderInterest: prismaUser.genderInterest,
      id: prismaUser.id,
      searchDistance: prismaUser.searchDistance,
      images: [],
      name: prismaUser.name,
    }
    //! Act
    const result = await sut.getUserByEmail('any email')
    //! Assert
    expect(result).toEqual(user)
  })

  test('ensure throw if prisma throws', async () => {
    //! Arrange
    prisma.user.findUnique.mockRejectedValueOnce(new Error('any error'))
    //! Act
    const promise = sut.getUserByEmail('any email')
    //! Assert
    await expect(promise).rejects.toThrow(new Error('any error'))
  })
})

describe('user-repository-impl.test.ts - update', () => {
  let prisma: DeepMockProxy<PrismaClient>
  let sut: UserRepositoryImpl
  let user: MockProxy<User>

  beforeEach(() => {
    user = mock<User>({ id: 'any id', description: '' })
    prisma = mockDeep<PrismaClient>()

    const prismaUser = mock<
      PrismaUser & { images: PrismaImage[]; description: Description }
    >({
      images: [],
    })

    prisma.user.update.mockResolvedValue(prismaUser)

    sut = new UserRepositoryImpl({
      prisma,
      imageRepository: mock<ImageRepository>(),
    })
  })

  test('ensure call prisma with correct params', async () => {
    //! Arrange
    //! Act
    await sut.update(user)
    //! Assert
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      include: { description: true, images: true },
      data: {
        email: user.email,
        name: user.name,
        birthdate: user.birthdate,
        gender: user.gender,
        genderInterest: user.genderInterest,
        searchDistance: user.searchDistance,
        description: {
          upsert: {
            create: { content: '' },
            update: { content: user.description },
          },
        },
      },
    })
  })

  test('ensure return correct user', async () => {
    //! Arrange
    const updatedUser = {
      id: 'updated id',
      email: 'any email',
      name: 'any name',
      description: { content: 'any description' },
      birthdate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      gender: 'male',
      genderInterest: 'female',
      searchDistance: 100,
      images: [],
    }
    prisma.user.update.mockResolvedValue(updatedUser)
    //! Act
    const result = await sut.update(user)
    //! Assert
    expect(result).toEqual({
      birthdate: expect.any(Date),
      email: updatedUser.email,
      gender: updatedUser.gender,
      genderInterest: updatedUser.genderInterest,
      id: updatedUser.id,
      name: updatedUser.name,
      description: updatedUser.description.content,
      searchDistance: updatedUser.searchDistance,
      images: [],
    } as User)
  })
})
