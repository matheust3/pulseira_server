import { Image, Location, PrismaClient, User } from '@prisma/client'
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { ImageRepository } from '../../core/application/gateways/image-repository'
import { InteractionRepositoryImpl } from './interaction-repository-impl'

describe('interaction-repository-impl.test.ts - getCandidates', () => {
  let prismaClient: DeepMockProxy<PrismaClient>
  let imageRepository: MockProxy<ImageRepository>
  let sut: InteractionRepositoryImpl

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>()

    prismaClient.user.findUnique.mockResolvedValue(
      mock<User & { location?: Location }>({
        location: mock<Location>(),
      }),
    )

    prismaClient.user.findMany.mockResolvedValue([])

    imageRepository = mock<ImageRepository>()
    sut = new InteractionRepositoryImpl({ prismaClient, imageRepository })
  })

  test('ensure throws if current user not found', async () => {
    //! Arrange
    prismaClient.user.findUnique.mockResolvedValue(null)
    //! Act
    //! Assert
    await expect(sut.getCandidates('userId')).rejects.toThrow('User not found')
  })

  test('ensure throws if current user location not found', async () => {
    //! Arrange
    prismaClient.user.findUnique.mockResolvedValue(
      mock<User & { location?: Location }>({ location: undefined }),
    )
    //! Act
    //! Assert
    await expect(sut.getCandidates('userId')).rejects.toThrow(
      'User Location not found',
    )
  })

  test('ensure returns empty array if no candidates found', async () => {
    //! Arrange
    prismaClient.user.findMany.mockResolvedValue([])
    //! Act
    const result = await sut.getCandidates('userId')
    //! Assert
    expect(result).toEqual([])
  })

  test('ensure calc candidate age correctly', async () => {
    //! Arrange
    jest.useFakeTimers().setSystemTime(new Date('2024-02-01'))
    prismaClient.user.findMany.mockResolvedValue([
      mock<User & { location?: Location; images: Image[] }>({
        id: 'candidateId',
        birthdate: new Date('2000-01-01'),
        location: mock<Location>({
          longitude: 0,
          latitude: 0,
        }),
        images: [],
      }),
      mock<User & { location?: Location; images: Image[] }>({
        id: 'candidateId',
        birthdate: new Date('2000-02-02'),
        location: mock<Location>({
          longitude: 0,
          latitude: 0,
        }),
        images: [],
      }),
    ])
    //! Act
    const result = await sut.getCandidates('userId')
    //! Assert
    expect(result[0].age).toEqual(24)
    expect(result[1].age).toEqual(23)
    jest.useRealTimers()
  })

  test('ensure calc distance correctly', async () => {
    //! Arrange
    prismaClient.user.findUnique.mockResolvedValue(
      mock<User & { location?: Location }>({
        location: mock<Location>({
          longitude: -55.93346064778029,
          latitude: -13.083428636250812,
        }),
      }),
    )
    prismaClient.user.findMany.mockResolvedValue([
      mock<User & { location?: Location; images: Image[] }>({
        id: 'candidateId',
        birthdate: new Date('2000-01-01'),
        location: mock<Location>({
          longitude: -55.92686241358865,
          latitude: -13.077074752983124,
        }),
        images: [],
      }),
      mock<User & { location?: Location; images: Image[] }>({
        id: 'candidateId',
        birthdate: new Date('2000-02-02'),
        location: mock<Location>({
          longitude: -55.92929785938609,
          latitude: -13.079238017782433,
        }),
        images: [],
      }),
      mock<User & { location?: Location; images: Image[] }>({
        id: 'candidateId',
        birthdate: new Date('2000-02-02'),
        location: mock<Location>({
          longitude: -55.930553133211205,
          latitude: -13.080627931529898,
        }),
        images: [],
      }),
    ])

    //! Act
    const result = await sut.getCandidates('userId')
    //! Assert
    expect(result[0].distance).toBeCloseTo(1004.93, 1)
    expect(result[1].distance).toBeCloseTo(648.39, 1)
    expect(result[2].distance).toBeCloseTo(442.89, 1)
  })
})
