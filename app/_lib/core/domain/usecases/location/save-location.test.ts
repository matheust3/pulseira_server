import { mock, MockProxy } from 'jest-mock-extended'
import { LocationRepository } from '../../../application/gateways/location-repository'
import { SaveLocation } from './save-location'
import { Location } from '../../models/location'

describe('save-location.test.ts - execute', () => {
  let locationRepositoryMock: MockProxy<LocationRepository>
  let location: Location
  let sut: SaveLocation

  beforeEach(() => {
    locationRepositoryMock = mock<LocationRepository>()

    sut = new SaveLocation({ locationRepository: locationRepositoryMock })

    location = {
      latitude: 1,
      longitude: 2,
      userId: 'any_user_id',
    }
  })

  test('ensure call repository correctly', async () => {
    //! Arrange
    //! Act
    await sut.execute(location)
    //! Assert
    expect(locationRepositoryMock.save).toHaveBeenCalledWith(location)
  })

  test('ensure throws if repository throws', async () => {
    //! Arrange
    locationRepositoryMock.save.mockRejectedValueOnce(
      new Error('repository_error'),
    )
    //! Act
    const promise = sut.execute(location)
    //! Assert
    await expect(promise).rejects.toThrow(new Error('repository_error'))
  })
})
