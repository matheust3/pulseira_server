import { Resend } from 'resend'
import { EmailProvider } from '../core/application/gateways/email-provider'
import { EmailTokenRepository } from '../core/application/gateways/email-token-repository'
import { prisma } from '../infra/db/prisma-client'
import { EmailTokenRepositoryImpl } from '../infra/repositories/email-token-repository-impl'
import { ResendEmailProvider } from '../infra/gateways/resend-email-provider'
import { JwtServiceImpl } from '../infra/services/jwt-service-impl'
import { JwtService } from '../core/application/gateways/jwt-service'
import { LoadMiddlewares } from './load-middlewares'
import { LoadUseCases } from './load-use-cases'
import { AccountRepositoryImpl } from '../infra/repositories/account-repository-impl'
import { UserRepositoryImpl } from '../infra/repositories/user-repository-impl'
import { ImageRepositoryImpl } from '../infra/repositories/image-repository-impl'
import { UuidServiceImpl } from '../infra/services/uuid-service-impl'
import { S3Client } from '@aws-sdk/client-s3'
import { LocationRepositoryImpl } from '../infra/repositories/location-repository-impl'
import { InteractionRepositoryImpl } from '../infra/repositories/interaction-repository-impl'

export class DependencyContainer {
  // eslint-disable-next-line no-use-before-define
  private static instance: DependencyContainer
  // Middleware
  private readonly loadMiddlewares: LoadMiddlewares
  public get middlewares(): LoadMiddlewares {
    return this.loadMiddlewares
  }

  // UseCases
  private readonly loadUseCases: LoadUseCases
  public get useCases(): LoadUseCases {
    return this.loadUseCases
  }

  // Repositories
  private readonly emailTokenRepository: EmailTokenRepository
  // Providers
  private readonly emailProvider: EmailProvider
  // Services
  private readonly jwtService: JwtService

  private constructor() {
    const prismaClient = prisma
    const resend = new Resend(process.env.RESEND_API_KEY)

    this.jwtService = new JwtServiceImpl()
    const uuidService = new UuidServiceImpl()
    const s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
    })

    const imageRepository = new ImageRepositoryImpl({
      prismaClient,
      s3Client,
      uuidService,
    })
    const accountRepository = new AccountRepositoryImpl({ prismaClient })
    const userRepository = new UserRepositoryImpl({
      prisma: prismaClient,
      imageRepository,
    })
    this.emailTokenRepository = new EmailTokenRepositoryImpl(prismaClient)
    this.emailProvider = new ResendEmailProvider(resend)
    const locationRepository = new LocationRepositoryImpl({ prismaClient })
    const interactionRepository = new InteractionRepositoryImpl({
      prismaClient,
      imageRepository,
    })

    // UseCases
    this.loadUseCases = new LoadUseCases({
      emailTokenRepository: this.emailTokenRepository,
      emailProvider: this.emailProvider,
      jwtService: this.jwtService,
      accountRepository,
      userRepository,
      imageRepository,
      interactionRepository,
      locationRepository,
    })
    // Middlewares
    this.loadMiddlewares = new LoadMiddlewares({
      authWithEmailOnly: this.useCases.authWithEmailOnly,
      getTokenPayload: this.useCases.getTokenPayloadUseCase,
    })
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer()
    }
    return DependencyContainer.instance
  }

  public getJwtService(): JwtService {
    return this.jwtService
  }
}

export const dependencyContainer = DependencyContainer.getInstance()
