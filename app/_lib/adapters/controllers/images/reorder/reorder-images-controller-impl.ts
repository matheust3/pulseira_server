import { ReorderImagesController } from '@/app/_lib/core/application/controllers/images/reorder/reorder-images-controller'
import { Image } from '@/app/_lib/core/domain/models/file/image'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { ReorderImages } from '@/app/_lib/core/domain/usecases/images/reorder-images'
import { imageValidator } from '@/app/_lib/utils/validators/image-validator'

export class ReorderImagesControllerImpl implements ReorderImagesController {
  private readonly reorderImagesUseCase: ReorderImages

  constructor(args: { reorderImagesUseCase: ReorderImages }) {
    this.reorderImagesUseCase = args.reorderImagesUseCase
  }

  async put(request: Request, response: ApiResponse): Promise<void> {
    if (!request.authorization.userId) {
      response.status = 401
      response.body = { error: 'User id is undefined' }
    } else {
      let images: Image[] | undefined
      try {
        images = (await request.json()) as Image[]
      } catch (e) {
        response.status = 400
        response.body = { error: 'invalid json' }
        return
      }
      if (images.length === 0) {
        response.status = 400
        response.body = { error: 'images is required' }
      } else if (!Array.isArray(images)) {
        response.status = 400
        response.body = { error: 'images must be an array' }
      } else {
        // validate images
        const valid = images.every((image) => {
          return imageValidator.isValidSync(image, { strict: true })
        })
        if (!valid) {
          response.status = 400
          response.body = { error: 'invalid image' }
        } else {
          await this.reorderImagesUseCase.execute(
            request.authorization.userId,
            images,
          )
          response.status = 200
          response.body = { message: 'Images reordered' }
        }
      }
    }
  }
}
