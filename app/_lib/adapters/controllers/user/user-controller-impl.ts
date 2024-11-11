import { LoadUseCases } from '@/app/_lib/config/load-use-cases'
import { UserController } from '@/app/_lib/core/application/controllers/user/user-controller'
import { InvalidJsonError } from '@/app/_lib/core/domain/errors/invalid-json-error'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { User } from '@/app/_lib/core/domain/models/user'
import { userValidator } from '@/app/_lib/utils/validators/user-validator'
import { ValidationError } from 'yup'

export class UserControllerImpl implements UserController {
  private readonly loadUseCases: LoadUseCases

  constructor(args: { loadUseCases: LoadUseCases }) {
    this.loadUseCases = args.loadUseCases
  }

  async get(request: Request, response: ApiResponse): Promise<void> {
    if (request.authorization.userId === undefined) {
      response.status = 401
      response.body = { message: 'Unauthorized' }
    } else {
      try {
        const user = await this.loadUseCases.getUserByIdUseCase.execute(
          request.authorization.userId,
        )
        response.status = 200
        response.body = user
      } catch (e) {
        response.status = 500
        response.body = { message: 'Internal Server Error' }
        console.error(e)
      }
    }
  }

  async put(request: Request, response: ApiResponse): Promise<void> {
    if (request.authorization.userId === undefined) {
      response.status = 401
      response.body = { message: 'Unauthorized' }
    } else {
      try {
        const jsonBody = await request.json()
        const user: User = userValidator.validateSync(jsonBody)
        if (user.id !== request.authorization.userId) {
          response.status = 403
          response.body = { message: 'Forbidden' }
        } else {
          const updatedUser =
            await this.loadUseCases.updateUserUseCase.execute(user)
          response.status = 200
          response.body = updatedUser
        }
      } catch (e) {
        if (e instanceof ValidationError) {
          response.status = 400
          response.body = { message: e.message }
        } else if (e instanceof InvalidJsonError) {
          response.status = 400
          response.body = { message: e.message }
        } else {
          throw e
        }
      }
    }
  }
}
