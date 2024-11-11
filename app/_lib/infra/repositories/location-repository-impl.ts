import { PrismaClient } from '@prisma/client'
import { LocationRepository } from '../../core/application/gateways/location-repository'
import { Location } from '../../core/domain/models/location'

export class LocationRepositoryImpl implements LocationRepository {
  private readonly prismaClient: PrismaClient

  constructor(args: { prismaClient: PrismaClient }) {
    this.prismaClient = args.prismaClient
  }

  async save(location: Location): Promise<void> {
    await this.prismaClient.location.upsert({
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
  }
}
