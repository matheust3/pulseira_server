import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { LocationRepositoryImpl } from './location-repository-impl'
import { PrismaClient } from '@prisma/client/extension'
import { Location } from '../../core/domain/models/location'

describe('location-repository-impl.test.ts - save', () => {
  let prismaClient: DeepMockProxy<PrismaClient>
  let sut: LocationRepositoryImpl

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>()
    sut = new LocationRepositoryImpl({
      prismaClient,
    })
  })

  test('ensure call prisma with correct params', async () => {
    //! Arrange
    const location: Location = {
      latitude: 0,
      longitude: 0,
      userId: 'any_id',
    }
    //! Act
    await sut.save(location)
    //! Assert
    expect(prismaClient.location.upsert).toHaveBeenCalledWith({
      where: { userId: location.userId },
      update: {
        latitude: location.latitude,
        longitude: location.longitude,
      },
      create: {
        userId: location.userId,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    })
  })

  test('ensure throws if prisma throws', async () => {
    //! Arrange
    prismaClient.location.upsert.mockRejectedValueOnce(new Error())
    //! Act
    const promise = sut.save({
      latitude: 0,
      longitude: 0,
      userId: 'any_id',
    })
    //! Assert
    await expect(promise).rejects.toThrow()
  })
})
