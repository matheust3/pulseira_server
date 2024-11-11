import { PassThrough } from 'stream'
import { ImageRepository } from '../../../application/gateways/image-repository'
import { Image } from '../../models/file/image'

export class SaveImage {
  private readonly imageRepository: ImageRepository

  constructor(args: { imageRepository: ImageRepository }) {
    this.imageRepository = args.imageRepository
  }

  async execute(
    userId: string,
    stream: PassThrough,
    flag: Image['flag'],
  ): Promise<Image> {
    return await this.imageRepository.save(userId, stream, flag)
  }
}
