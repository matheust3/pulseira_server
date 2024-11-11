import { PrismaClient } from '@prisma/client'
import { EmailTokenRepository } from '../../core/application/gateways/email-token-repository'
import { EmailToken } from '../../core/domain/models/email-token'
import { randomUUID } from 'crypto'

export class EmailTokenRepositoryImpl implements EmailTokenRepository {
  private readonly prismaClient: PrismaClient

  constructor(prismaClient: PrismaClient) {
    this.prismaClient = prismaClient
  }

  async findTokenById(tokenId: string): Promise<EmailToken | null> {
    const tokenResult = await this.prismaClient.emailToken.findFirst({
      where: { id: tokenId },
    })

    if (tokenResult === null) return null

    return {
      createdAt: tokenResult.createdAt.toISOString(),
      email: tokenResult.email,
      verified: tokenResult.verified,
      id: tokenResult.id,
      token: tokenResult.token,
      updatedAt: tokenResult.updatedAt.toISOString(),
    }
  }

  async setAsVerified(tokenId: string): Promise<void> {
    await this.prismaClient.emailToken.update({
      where: { id: tokenId },
      data: { verified: true },
    })
  }

  async createEmailToken(email: string, token: string): Promise<EmailToken> {
    const emailToken = {
      email,
      token,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      id: randomUUID(),
    }

    const result = await this.prismaClient.emailToken.upsert({
      create: {
        id: emailToken.id,
        email: emailToken.email,
        token: emailToken.token,
        createdAt: new Date(emailToken.createdAt),
        updatedAt: new Date(emailToken.updatedAt),
      },
      update: {
        email: emailToken.email,
        token: emailToken.token,
        verified: false,
        createdAt: new Date(emailToken.createdAt),
        updatedAt: new Date(emailToken.updatedAt),
      },
      where: { email: emailToken.email },
    })

    return {
      id: result.id,
      email: result.email,
      verified: result.verified,
      token: result.token,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    }
  }

  async findEmailToken(
    email: string,
    token: string,
  ): Promise<EmailToken | null> {
    const tokenResult = await this.prismaClient.emailToken.findFirst({
      where: { token, email },
    })

    if (tokenResult === null) return null

    return {
      createdAt: tokenResult.createdAt.toISOString(),
      email: tokenResult.email,
      verified: tokenResult.verified,
      id: tokenResult.id,
      token: tokenResult.token,
      updatedAt: tokenResult.updatedAt.toISOString(),
    }
  }
}
