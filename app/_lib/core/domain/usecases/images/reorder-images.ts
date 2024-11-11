import { ImageRepository } from '../../../application/gateways/image-repository'
import { Image } from '../../models/file/image'

export class ReorderImages {
  private readonly imageRepository: ImageRepository

  constructor(args: { imageRepository: ImageRepository }) {
    this.imageRepository = args.imageRepository
  }

  async execute(userId: string, images: Image[]): Promise<void> {
    return await this.imageRepository.reorderImages(userId, images)
  }
}
