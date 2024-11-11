import { PrismaClient } from '@prisma/client'
import { UserRepository } from '../../core/application/gateways/user-repository'
import { User } from '../../core/domain/models/user'
import { Image } from '../../core/domain/models/file/image'
import { ImageRepository } from '../../core/application/gateways/image-repository'

export class UserRepositoryImpl implements UserRepository {
  private readonly prisma: PrismaClient
  private readonly imageRepository: ImageRepository

  constructor(args: {
    prisma: PrismaClient
    imageRepository: ImageRepository
  }) {
    this.prisma = args.prisma
    this.imageRepository = args.imageRepository
  }

  async create(user: User): Promise<User> {
    const newUser = await this.prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        birthdate: user.birthdate,
        gender: user.gender,
        genderInterest: user.genderInterest,
        searchDistance: user.searchDistance,
      },
    })

    return {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      birthdate: newUser.birthdate,
      gender: newUser.gender,
      genderInterest: newUser.genderInterest,
      description: '',
      searchDistance: newUser.searchDistance,
      images: [],
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await this.prisma.user.findUnique({
      where: { id },
      include: { description: true, images: true },
    })

    if (result === null) {
      return null
    } else {
      const profileImages = result.images.filter(
        (image) => image.flag === 'profile',
      )

      const images = await Promise.all(
        profileImages.map(async (image) => {
          return {
            id: image.id,
            userId: image.userId,
            flag: image.flag,
            orderId: image.orderId,
            // Get the image url from the imageRepository
            url: await this.imageRepository.getImageUrlByFileKey(image.fileKey),
          } as Image
        }),
      )

      const user: User = {
        id: result.id,
        email: result.email,
        name: result.name,
        gender: result.gender,
        genderInterest: result.genderInterest,
        description: result.description?.content ?? '',
        birthdate: result.birthdate,
        searchDistance: result.searchDistance,
        images,
      }

      return user
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { description: true, images: true },
    })

    if (user === null) {
      return null
    }

    const profileImages = user.images.filter(
      (image) => image.flag === 'profile',
    )

    const images = await Promise.all(
      profileImages.map(async (image) => {
        return {
          id: image.id,
          userId: image.userId,
          flag: image.flag,
          orderId: image.orderId,
          // Get the image url from the imageRepository
          url: await this.imageRepository.getImageUrlByFileKey(image.fileKey),
        } as Image
      }),
    )

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      description: user.description?.content ?? '',
      birthdate: user.birthdate,
      gender: user.gender,
      genderInterest: user.genderInterest,
      searchDistance: user.searchDistance,
      images,
    }
  }

  async update(user: Partial<User>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
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
            create: { content: user.description ?? '' },
            update: { content: user.description },
          },
        },
      },
    })

    const profileImages = updatedUser.images.filter(
      (image) => image.flag === 'profile',
    )

    const images = await Promise.all(
      profileImages.map(async (image) => {
        return {
          id: image.id,
          userId: image.userId,
          flag: image.flag,
          orderId: image.orderId,
          // Get the image url from the imageRepository
          url: await this.imageRepository.getImageUrlByFileKey(image.fileKey),
        } as Image
      }),
    )

    return {
      birthdate: updatedUser.birthdate,
      description: updatedUser.description?.content ?? '',
      email: updatedUser.email,
      gender: updatedUser.gender,
      genderInterest: updatedUser.genderInterest,
      id: updatedUser.id,
      name: updatedUser.name,
      searchDistance: updatedUser.searchDistance,
      images,
    }
  }
}
