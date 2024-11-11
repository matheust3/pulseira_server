import { ImageRepository } from '../../../application/gateways/image-repository'

export class DeleteImage {
  private readonly imageRepository: ImageRepository

  constructor(args: { imageRepository: ImageRepository }) {
    this.imageRepository = args.imageRepository
  }

  async execute(userId: string, imageId: string): Promise<void> {
    return await this.imageRepository.delete(userId, imageId)
  }
}
