import { PrismaClient } from '@prisma/client'
import { PhoneTokenRepository } from '../../core/application/gateways/phone-token-repository'
import { PhoneToken } from '../../core/domain/models/phone-token'

export class PhoneTokenRepositoryImpl implements PhoneTokenRepository {
  constructor(private readonly prismaClient: PrismaClient) {}

  async save(token: PhoneToken): Promise<void> {
    await this.prismaClient.phoneToken.upsert({
      create: {
        phone: token.phone,
        token: token.token,
        id: token.id,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
      },
      update: {
        phone: token.phone,
        token: token.token,
        id: token.id,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
      },
      where: {
        phone: token.phone,
      },
    })
  }
}
