import { GetAccountStatus as IController } from '@/app/_lib/core/application/controllers/get-account-status'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { GetAccountStatus } from '@/app/_lib/core/domain/usecases/account/get-account-status'

export class GetAccountStatusController implements IController {
  private readonly getAccountStatusUseCase: GetAccountStatus

  constructor(args: { getAccountStatusUseCase: GetAccountStatus }) {
    this.getAccountStatusUseCase = args.getAccountStatusUseCase
  }

  async get(request: Request, response: ApiResponse): Promise<void> {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (token === undefined) {
      response.body = { error: 'unauthorized' }
      response.status = 401
    } else {
      const result = await this.getAccountStatusUseCase.execute(token)
      response.body = result
      response.status = 200
    }
  }
}
