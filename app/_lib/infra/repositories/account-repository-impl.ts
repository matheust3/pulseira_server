import { PrismaClient } from '@prisma/client'
import { AccountRepository } from '../../core/application/gateways/account-repository'
import { AccountStatus } from '../../core/domain/models/account-status'

export class AccountRepositoryImpl implements AccountRepository {
  private readonly prismaClient: PrismaClient

  constructor(args: { prismaClient: PrismaClient }) {
    this.prismaClient = args.prismaClient
  }

  async getAccountStatus(tokenId: string): Promise<AccountStatus> {
    const accountStatus: AccountStatus = {
      basicInformation: false,
      description: false,
      profileImage: false,
    }

    const authToken = await this.prismaClient.emailToken.findUnique({
      where: {
        id: tokenId,
      },
    })

    if (authToken === null) {
      return accountStatus
    } else {
      const user = await this.prismaClient.user.findUnique({
        where: {
          email: authToken.email,
        },
        include: { description: true, images: true },
      })

      accountStatus.basicInformation = user !== null
      if (user !== null) {
        accountStatus.description = user.description !== null
        accountStatus.profileImage = user.images.length > 0
      }
      return accountStatus
    }
  }
}
