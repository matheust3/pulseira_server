import { ImagesController } from '@/app/_lib/core/application/controllers/images/save-image-controller'
import { MaxImagesError } from '@/app/_lib/core/domain/errors/max-images-error'
import { Image } from '@/app/_lib/core/domain/models/file/image'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { DeleteImage } from '@/app/_lib/core/domain/usecases/images/delete-image'
import { SaveImage } from '@/app/_lib/core/domain/usecases/images/save-image'
import sharp, { fit } from 'sharp'
import { PassThrough } from 'stream'

export class ImagesControllerImpl implements ImagesController {
  private readonly savaImageUseCase: SaveImage
  private readonly deleteImageUseCase: DeleteImage

  constructor(args: {
    savaImageUseCase: SaveImage
    deleteImageUseCase: DeleteImage
  }) {
    this.savaImageUseCase = args.savaImageUseCase
    this.deleteImageUseCase = args.deleteImageUseCase
  }

  async delete(req: Request, res: ApiResponse): Promise<void> {
    const imageId = req.searchParams.get('imageId')
    if (!imageId) {
      res.status = 400
      res.body = { error: 'imageId is required' }
    } else {
      if (!req.authorization.userId) {
        res.status = 401
        res.body = { error: 'User id is undefined' }
      } else {
        try {
          await this.deleteImageUseCase.execute(
            req.authorization.userId,
            imageId,
          )
          res.status = 204
          res.body = null
        } catch (e) {
          if (e instanceof Error && e.message === 'Image not found') {
            res.status = 404
            res.body = { error: 'Image not found' }
          } else {
            throw e
          }
        }
      }
    }
  }

  async post(req: Request, res: ApiResponse): Promise<void> {
    const flag = req.searchParams.get('flag') as Image['flag']
    if (!flag) {
      res.status = 400
      res.body = { error: 'flag is required' }
    } else if (flag !== 'profile' && flag !== 'id') {
      res.status = 400
      res.body = { error: 'Invalid flag' }
    } else if (!req.headers.get('content-type')?.includes('image')) {
      res.status = 400
      res.body = { error: 'Invalid content-type' }
    } else {
      if (!req.authorization.userId) {
        res.status = 401
        res.body = { error: 'User id is undefined' }
      } else {
        const pass = new PassThrough()

        const maxFileSize = 1024 * 1024 * 20 // 20MB
        let streamSize = 0

        const writableStream = new WritableStream({
          write(chunk, controller): void {
            pass.write(chunk)
            streamSize += chunk.length
            if (streamSize > maxFileSize) {
              controller.error(new Error('File size exceeds the limit'))
            }
          },
          close(): void {
            pass.end()
          },
          abort(): void {
            pass.destroy()
          },
        })

        // resize image to 1080x1080 and convert to webp
        const transform = sharp({ animated: true })
          .resize({
            width: 1080,
            height: 1080,
            fit: fit.inside,
            withoutEnlargement: true,
          })
          .webp()
        // Encadeia o stream de transformação ao PassThrough stream
        pass.pipe(transform)

        const pipeStream = async (): Promise<void> => {
          try {
            await req.body?.pipeTo(writableStream)
          } catch (e) {
            if (streamSize > maxFileSize) {
              res.status = 400
              res.body = { error: 'File size exceeds the limit' }
            } else {
              throw e
            }
          }
        }

        try {
          const passThrough = new PassThrough()
          transform.pipe(passThrough)
          const imagePromise = this.savaImageUseCase.execute(
            req.authorization.userId,
            passThrough,
            flag,
          )
          await pipeStream()
          if (res.status === 400) return // Se o tamanho do arquivo excedeu o limite, não envia a resposta
          res.status = 200
          res.body = await imagePromise
        } catch (e) {
          if (e instanceof MaxImagesError) {
            res.status = 400
            res.body = { error: e.message }
          } else {
            throw e
          }
        }
      }
    }
  }
}
