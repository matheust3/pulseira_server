import { CreateUserController } from '@/app/_lib/core/application/controllers/user/create-user-controller'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { User } from '@/app/_lib/core/domain/models/user'
import { GetAccountStatus } from '@/app/_lib/core/domain/usecases/account/get-account-status'
import { GetEmailFromToken } from '@/app/_lib/core/domain/usecases/authentication/get-email-from-token'
import { CreateUser } from '@/app/_lib/core/domain/usecases/user/create-user'
import { userValidator } from '@/app/_lib/utils/validators/user-validator'
import { ValidationError } from 'yup'

export class CreateUserControllerImpl implements CreateUserController {
  private readonly createUserUseCase: CreateUser
  private readonly getAccountStatusUseCase: GetAccountStatus
  private readonly getEmailFromTokenUseCase: GetEmailFromToken

  constructor(args: {
    createUserUseCase: CreateUser
    getAccountStatusUseCase: GetAccountStatus
    getEmailFromTokenUseCase: GetEmailFromToken
  }) {
    this.createUserUseCase = args.createUserUseCase
    this.getAccountStatusUseCase = args.getAccountStatusUseCase
    this.getEmailFromTokenUseCase = args.getEmailFromTokenUseCase
  }

  async put(request: Request, response: ApiResponse): Promise<void> {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (token === undefined) {
      response.body = { error: 'unauthorized' }
      response.status = 401
    } else {
      let json: { user: User }
      let user: User
      try {
        json = (await request.json()) as typeof json
        try {
          const userEmail = await this.getEmailFromTokenUseCase.execute(token)
          json.user.email = userEmail
          json.user.searchDistance = 100
          json.user.birthdate = new Date(json.user.birthdate)
          user = userValidator.validateSync(json.user)
        } catch (e) {
          if (e instanceof ValidationError) {
            response.body = { error: e.message }
            response.status = 400
          } else {
            response.body = { error: 'internal server error' }
            response.status = 500
          }
          return
        }
      } catch (e) {
        response.body = { error: 'invalid json' }
        response.status = 400
        return
      }

      const accountStatus = await this.getAccountStatusUseCase.execute(token)
      if (accountStatus.basicInformation) {
        response.body = { error: 'account already exists' }
        response.status = 409
      } else {
        const createdUser = await this.createUserUseCase.execute(user)
        response.body = { user: createdUser }
        response.status = 201
      }
    }
  }
}
