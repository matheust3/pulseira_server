import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { ApiController } from '../../api-controller'
import { Request } from '@/app/_lib/core/domain/models/routes/request'

export interface ReorderImagesController extends ApiController {
  put(request: Request, response: ApiResponse): Promise<void>
}
