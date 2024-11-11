import { ValidationError } from 'yup'
import { LocationController } from '../../core/application/controllers/location-controller'
import { InvalidJsonError } from '../../core/domain/errors/invalid-json-error'
import { ApiResponse } from '../../core/domain/models/routes/api-response'
import { Request } from '../../core/domain/models/routes/request'
import { SaveLocation } from '../../core/domain/usecases/location/save-location'
import { locationValidator } from '../../utils/validators/location-validator'

export class LocationControllerImpl implements LocationController {
  private readonly saveLocationUseCase: SaveLocation

  constructor(args: { saveLocationUseCase: SaveLocation }) {
    this.saveLocationUseCase = args.saveLocationUseCase
  }

  async put(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization?.userId === undefined) {
      res.status = 401
      res.body = { message: 'Unauthorized' }
    } else {
      try {
        const body = await req.json()
        const location = locationValidator.validateSync(body)
        location.userId = req.authorization.userId
        await this.saveLocationUseCase.execute(location)
        res.status = 204
        res.body = null
      } catch (e) {
        if (e instanceof InvalidJsonError) {
          res.status = 400
          res.body = { message: 'Invalid request' }
        } else if (e instanceof ValidationError) {
          res.status = 400
          res.body = { message: 'Invalid request' }
        } else {
          throw e
        }
      }
    }
  }
}
