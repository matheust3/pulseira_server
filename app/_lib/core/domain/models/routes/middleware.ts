import { ApiResponse } from './api-response'
import { Request } from './request'

export interface Middleware {
  handler(
    request: Request,
    response: ApiResponse,
    next: () => void,
  ): Promise<void>
}
