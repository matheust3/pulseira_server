import { ApiResponse } from '../../../domain/models/routes/api-response'
import { Request } from '../../../domain/models/routes/request'
import { ApiController } from '../api-controller'

export interface ImagesController extends ApiController {
  delete(request: Request, response: ApiResponse): Promise<void>
  post(request: Request, response: ApiResponse): Promise<void>
}
