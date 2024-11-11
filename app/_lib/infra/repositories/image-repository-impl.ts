import { PassThrough } from 'stream'
import { ImageRepository } from '../../core/application/gateways/image-repository'
import { Image } from '../../core/domain/models/file/image'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { PrismaClient } from '@prisma/client'
import { UuidService } from '../../core/application/gateways/uuid-service'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { MaxImagesError } from '../../core/domain/errors/max-images-error'

export class ImageRepositoryImpl implements ImageRepository {
  private readonly s3Client: S3Client
  private readonly prismaClient: PrismaClient
  private readonly uuidService: UuidService

  constructor(args: {
    s3Client: S3Client
    prismaClient: PrismaClient
    uuidService: UuidService
  }) {
    this.s3Client = args.s3Client
    this.uuidService = args.uuidService
    this.prismaClient = args.prismaClient
  }

  async delete(userId: string, imageId: string): Promise<void> {
    const image = await this.prismaClient.image.findUnique({
      where: {
        userId,
        id: imageId,
      },
    })

    if (image == null) {
      throw new Error('Image not found')
    }

    // Se por algum motivo a imagem não for deletada no banco de dados, a imagem não será deletada do S3
    // Delete image from database
    await this.prismaClient.image.delete({
      where: {
        id: imageId,
      },
    })

    // Decrement orderId of subsequent images
    await this.prismaClient.image.updateMany({
      where: {
        userId,
        orderId: {
          gt: image.orderId,
        },
      },
      data: {
        orderId: {
          decrement: 1,
        },
      },
    })

    // Delete image from S3
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: image.fileKey,
      }),
    )
  }

  async getImageUrlByFileKey(fileKey: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    })
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 86400,
    })

    return signedUrl
  }

  async reorderImages(userId: string, images: Image[]): Promise<void> {
    await this.prismaClient.$transaction(
      images.map((image) =>
        this.prismaClient.image.update({
          where: {
            id: image.id,
            userId,
          },
          data: {
            orderId: image.orderId,
          },
        }),
      ),
    )
  }

  async save(
    userId: string,
    stream: PassThrough,
    flag: Image['flag'],
  ): Promise<Image> {
    // Pega o número de imagens que o usuário já tem
    const userImages = await this.prismaClient.image.count({
      where: {
        userId,
      },
    })

    // Se o usuário já tem 12 imagens, não é permitido adicionar mais
    if (userImages >= 12) {
      throw new MaxImagesError()
    }

    const imageId = this.uuidService.generateV7()
    const fileKey = `${userId}/${imageId}.webp`

    // Salva a imagem no S3 e no banco de dados
    await this.prismaClient.$transaction(async (prisma) => {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileKey,
          Body: stream,
          ContentType: 'image/webp',
        },
      })

      await upload.done()

      await prisma.image.create({
        data: {
          id: imageId,
          orderId: userImages,
          fileKey,
          userId,
          flag,
        },
      })

      if (flag === 'profile') {
        // Marca que o usuário atualizou as fotos dele em todas as interações que ele participou
        await prisma.interaction.updateMany({
          where: {
            candidateId: userId,
          },
          data: {
            updatedPhotos: true,
          },
        })
      }
    })

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileKey,
    })
    const signedUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 86400,
    })

    return {
      id: imageId,
      orderId: userImages,
      url: signedUrl,
      userId,
      flag,
    }
  }
}
