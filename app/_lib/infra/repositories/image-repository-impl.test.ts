import { PrismaClient, Image as PrismaImage } from '@prisma/client'
import { ImageRepositoryImpl } from './image-repository-impl'
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { PassThrough } from 'stream'
import { UuidService } from '../../core/application/gateways/uuid-service'
import { Upload } from '@aws-sdk/lib-storage'
import { Image } from '../../core/domain/models/file/image'

const uploadMock = mockDeep<Upload>()
jest.mock('@aws-sdk/lib-storage', () => ({
  Upload: jest.fn().mockImplementation(() => uploadMock),
}))

const getObjectCommandMock = mockDeep<GetObjectCommand>()
const deleteObjectCommandMock = mockDeep<DeleteObjectCommand>()
jest.mock('@aws-sdk/client-s3', () => ({
  GetObjectCommand: jest.fn().mockImplementation(() => getObjectCommandMock),
  DeleteObjectCommand: jest
    .fn()
    .mockImplementation(() => deleteObjectCommandMock),
}))

const getSignedUrlMock = jest.fn()
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args: unknown[]): string => {
    return getSignedUrlMock(...args)
  },
}))

describe('image-repository-impl.test.ts - delete', () => {
  let prismaClient: DeepMockProxy<PrismaClient>
  let s3Client: DeepMockProxy<S3Client>
  let uuidService: MockProxy<UuidService>
  let sut: ImageRepositoryImpl

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>()
    s3Client = mockDeep<S3Client>()
    uuidService = mock<UuidService>()

    prismaClient.image.findUnique.mockResolvedValue(
      mock<PrismaImage>({ fileKey: 'fileKey', orderId: 1 }),
    )

    jest.clearAllMocks()

    sut = new ImageRepositoryImpl({ prismaClient, s3Client, uuidService })
  })

  test('ensure check image exists for this userId', async () => {
    //! Arrange
    //! Act
    await sut.delete('userId', 'imageId')
    //! Assert
    expect(prismaClient.image.findUnique).toHaveBeenCalledWith({
      where: {
        userId: 'userId',
        id: 'imageId',
      },
    })
  })

  test('ensure decrement orderId of subsequent images', async () => {
    //! Arrange
    //! Act
    await sut.delete('userId', 'imageId')
    //! Assert
    expect(prismaClient.image.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'userId',
        orderId: {
          gt: 1,
        },
      },
      data: {
        orderId: {
          decrement: 1,
        },
      },
    })
  })

  test('ensure throw if image not found', async () => {
    //! Arrange
    prismaClient.image.findUnique.mockResolvedValue(null)
    //! Act
    const result = sut.delete('userId', 'imageId')
    //! Assert
    await expect(result).rejects.toThrow('Image not found')
    expect(DeleteObjectCommand).not.toHaveBeenCalled()
    expect(prismaClient.image.delete).not.toHaveBeenCalled()
  })

  test('ensure call client to delete image with correct params', async () => {
    //! Arrange
    //! Act
    await sut.delete('userId', 'imageId')
    //! Assert
    expect(DeleteObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'fileKey',
    })
  })

  test('ensure call prismaClient.image.delete with correct params', async () => {
    //! Arrange
    //! Act
    await sut.delete('userId', 'imageId')
    //! Assert
    expect(prismaClient.image.delete).toHaveBeenCalledWith({
      where: {
        id: 'imageId',
      },
    })
  })
})

describe('image-repository-impl.test.ts - getImageUrlByFileKey', () => {
  let prismaClient: DeepMockProxy<PrismaClient>
  let s3Client: DeepMockProxy<S3Client>
  let uuidService: MockProxy<UuidService>
  let sut: ImageRepositoryImpl

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>()
    s3Client = mockDeep<S3Client>()
    uuidService = mock<UuidService>()

    uploadMock.done.mockResolvedValue(
      mock<CompleteMultipartUploadCommandOutput>(),
    )
    getSignedUrlMock.mockResolvedValue('signedUrl')

    uuidService.generateV7.mockReturnValue('uuid')

    sut = new ImageRepositoryImpl({ prismaClient, s3Client, uuidService })
  })

  test('ensure call client with correct params', async () => {
    //! Arrange
    //! Act
    await sut.getImageUrlByFileKey('fileKey')
    //! Assert
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'fileKey',
    })
  })

  test('ensure call getSignedUrl with correct params', async () => {
    //! Arrange
    //! Act
    await sut.getImageUrlByFileKey('fileKey')
    //! Assert
    expect(getSignedUrlMock).toHaveBeenCalledWith(
      s3Client,
      getObjectCommandMock,
      {
        expiresIn: 86400,
      },
    )
  })

  test('ensure return signedUrl', async () => {
    //! Arrange
    //! Act
    const result = await sut.getImageUrlByFileKey('fileKey')
    //! Assert
    expect(result).toBe('signedUrl')
  })
})

describe('image-repository-impl.test.ts - reorderImages', () => {
  let prisma: DeepMockProxy<PrismaClient>
  let s3Client: DeepMockProxy<S3Client>
  let uuidService: MockProxy<UuidService>
  let sut: ImageRepositoryImpl

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>()
    s3Client = mockDeep<S3Client>()
    uuidService = mock<UuidService>()

    sut = new ImageRepositoryImpl({
      prismaClient: prisma,
      s3Client,
      uuidService,
    })
  })

  test('ensure call prisma with correct params', async () => {
    //! Arrange
    //! Act
    await sut.reorderImages('userId', [mock<Image>({ id: 'id1', orderId: 1 })])
    //! Assert
    expect(prisma.$transaction).toHaveBeenCalledWith([
      prisma.image.update({
        where: {
          id: 'id1',
          userId: 'userId',
        },
        data: {
          orderId: 1,
        },
      }),
    ])
  })

  test('ensure call prisma with correct params for multiple images', async () => {
    //! Arrange
    //! Act
    await sut.reorderImages('userId', [
      mock<Image>({ id: 'id1', orderId: 1 }),
      mock<Image>({ id: 'id2', orderId: 2 }),
    ])
    //! Assert
    expect(prisma.$transaction).toHaveBeenCalledWith([
      prisma.image.update({
        where: {
          id: 'id1',
          userId: 'userId',
        },
        data: {
          orderId: 1,
        },
      }),
      prisma.image.update({
        where: {
          id: 'id2',
          userId: 'userId',
        },
        data: {
          orderId: 2,
        },
      }),
    ])
  })

  test('ensure throw if prisma.$transaction throws', async () => {
    //! Arrange
    prisma.$transaction.mockRejectedValueOnce(new Error('prisma error'))
    //! Act
    const result = sut.reorderImages('userId', [
      mock<Image>({ id: 'id1', orderId: 1 }),
    ])
    //! Assert
    await expect(result).rejects.toThrow('prisma error')
  })
})

describe('image-repository-impl.test.ts - save', () => {
  let prismaClient: DeepMockProxy<PrismaClient>
  let s3Client: DeepMockProxy<S3Client>
  let uuidService: MockProxy<UuidService>
  let passThrough: PassThrough
  let sut: ImageRepositoryImpl

  beforeEach(() => {
    prismaClient = mockDeep<PrismaClient>()
    s3Client = mockDeep<S3Client>()
    uuidService = mock<UuidService>()
    passThrough = new PassThrough()

    uploadMock.done.mockResolvedValue(
      mock<CompleteMultipartUploadCommandOutput>(),
    )
    getSignedUrlMock.mockResolvedValue('signedUrl')

    uuidService.generateV7.mockReturnValue('uuid')

    prismaClient.image.count.mockResolvedValue(0)
    prismaClient.$transaction.mockImplementation(async (fn) => {
      await fn(prismaClient)
    })

    sut = new ImageRepositoryImpl({ prismaClient, s3Client, uuidService })
  })

  afterAll(() => {
    jest.clearAllMocks()
  })

  test('ensure create file id with uuid v7', async () => {
    //! Arrange
    //! Act
    await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(uuidService.generateV7).toHaveBeenCalled()
  })

  test('ensure create Upload correctly', async () => {
    //! Arrange
    //! Act
    await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(Upload).toHaveBeenCalledWith({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: 'userId/uuid.webp',
        Body: passThrough,
        ContentType: 'image/webp',
      },
    })
  })

  test('ensure call upload.done', async () => {
    //! Arrange
    //! Act
    await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(uploadMock.done).toHaveBeenCalled()
  })

  test('ensure throw if upload.done throws', async () => {
    //! Arrange
    uploadMock.done.mockRejectedValueOnce(new Error('upload error'))
    //! Act
    const result = sut.save('userId', passThrough, 'profile')
    //! Assert
    await expect(result).rejects.toThrow('upload error')
  })

  test('ensure call prismaClient.image.create', async () => {
    //! Arrange
    //! Act
    await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(prismaClient.image.create).toHaveBeenCalledWith({
      data: {
        id: 'uuid',
        orderId: 0,
        fileKey: 'userId/uuid.webp',
        userId: 'userId',
        flag: 'profile',
      },
    })
  })

  test('ensure throw if user already have 12 images', async () => {
    //! Arrange
    prismaClient.image.count.mockResolvedValueOnce(12)
    //! Act
    const result = sut.save('userId', passThrough, 'profile')
    //! Assert
    await expect(result).rejects.toThrow('User can only have 12 images')
  })

  test('ensure throw if prismaClient.image.create throws', async () => {
    //! Arrange
    prismaClient.image.create.mockRejectedValueOnce(new Error('prisma error'))
    //! Act
    const result = sut.save('userId', passThrough, 'profile')
    //! Assert
    await expect(result).rejects.toThrow('prisma error')
  })

  test('ensure create GetObjectCommand correctly', async () => {
    //! Arrange
    //! Act
    await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(GetObjectCommand).toHaveBeenCalledWith({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: 'userId/uuid.webp',
    })
  })

  test('ensure call getSignedUrl with GetObjectCommand', async () => {
    //! Arrange
    getSignedUrlMock.mockReset()
    //! Act
    await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(getSignedUrlMock).toHaveBeenCalledWith(
      s3Client,
      getObjectCommandMock,
      {
        expiresIn: 86400,
      },
    )
  })

  test('ensure return Image correctly', async () => {
    //! Arrange
    //! Act
    const result = await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(result).toEqual({
      id: 'uuid',
      orderId: 0,
      url: 'signedUrl',
      userId: 'userId',
      flag: 'profile',
    })
  })

  test('ensure set updated photo to true in interactions if is profile photo', async () => {
    //! Arrange
    //! Act
    await sut.save('userId', passThrough, 'profile')
    //! Assert
    expect(prismaClient.interaction.updateMany).toHaveBeenCalledWith({
      where: {
        candidateId: 'userId',
      },
      data: {
        updatedPhotos: true,
      },
    })
  })

  test('ensure not set updated photo to true in interactions if not is profile photo', async () => {
    //! Arrange
    //! Act
    await sut.save('userId', passThrough, 'id')
    //! Assert
    expect(prismaClient.interaction.updateMany).not.toHaveBeenCalled()
  })
})
