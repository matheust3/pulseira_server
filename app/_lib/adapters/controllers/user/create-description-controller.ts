import { CreateDescriptionController } from '@/app/_lib/core/application/controllers/user/create-description-controller'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { User } from '@/app/_lib/core/domain/models/user'
import { UpdateUser } from '@/app/_lib/core/domain/usecases/user/update-user'

export class CreateDescriptionControllerImpl
  implements CreateDescriptionController
{
  readonly updateUserUseCase: UpdateUser

  constructor(args: { updateUserUseCase: UpdateUser }) {
    this.updateUserUseCase = args.updateUserUseCase
  }

  async put(request: Request, response: ApiResponse): Promise<void> {
    if (!request.authorization.userId) {
      response.status = 401
      response.body = { message: 'User id is required' }
    } else {
      let json: { description: string }

      try {
        json = (await request.json()) as typeof json
        if (!json.description) {
          response.status = 400
          response.body = { message: 'description is required' }
        } else {
          const user: Partial<User> = {
            id: request.authorization.userId,
            description: json.description,
          }
          try {
            const updated = await this.updateUserUseCase.execute(user)
            response.status = 201
            response.body = updated
          } catch (e) {
            response.status = 500
            response.body = { message: 'Internal server error' }
            console.error(e)
          }
        }
      } catch (e) {
        response.status = 400
        response.body = { message: 'Invalid json' }
      }
    }
  }
}
