import { Location } from '../../domain/models/location'

export interface LocationRepository {
  save(location: Location): Promise<void>
}
