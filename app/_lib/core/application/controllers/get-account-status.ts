import { ApiController } from './api-controller'
import { Request } from '../../domain/models/routes/request'
import { ApiResponse } from '../../domain/models/routes/api-response'

export interface GetAccountStatus extends ApiController {
  get(request: Request, response: ApiResponse): Promise<void>
}
