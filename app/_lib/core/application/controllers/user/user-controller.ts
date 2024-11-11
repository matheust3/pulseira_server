import { ApiResponse } from '../../../domain/models/routes/api-response'
import { Request } from '../../../domain/models/routes/request'
import { ApiController } from '../api-controller'

export interface UserController extends ApiController {
  get(request: Request, response: ApiResponse): Promise<void>
  put(request: Request, response: ApiResponse): Promise<void>
}
