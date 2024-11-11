import { LocationRepository } from '../../../application/gateways/location-repository'
import { Location } from '../../models/location'

export class SaveLocation {
  private readonly locationRepository: LocationRepository

  constructor(args: { locationRepository: LocationRepository }) {
    this.locationRepository = args.locationRepository
  }

  async execute(location: Location): Promise<void> {
    await this.locationRepository.save(location)
  }
}
