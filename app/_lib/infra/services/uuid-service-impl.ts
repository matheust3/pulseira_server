import { v7 } from 'uuid'
import { UuidService } from '../../core/application/gateways/uuid-service'

export class UuidServiceImpl implements UuidService {
  generateV7(): string {
    return v7()
  }
}
