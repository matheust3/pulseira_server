import { Location } from '../../core/domain/models/location'
import { locationValidator } from './location-validator'

describe('location-validator.test.ts - validate', () => {
  test('ensure is valid', async () => {
    //! Arrange
    const location: Location = {
      longitude: 0,
      latitude: 0,
      userId: 'any_id',
    }
    //! Act
    //! Assert
    expect(locationValidator.validateSync(location)).toEqual(location)
  })

  test('ensure is invalid when latitude is not provided', async () => {
    //! Arrange
    const location = {
      longitude: 0,
      latitude: undefined,
      userId: 'any_id',
    }
    //! Act
    //! Assert
    expect(() => locationValidator.validateSync(location)).toThrow()
  })

  test('ensure is invalid when longitude is not provided', async () => {
    //! Arrange
    const location = {
      longitude: undefined,
      latitude: 0,
      userId: 'any_id',
    }
    //! Act
    //! Assert
    expect(() => locationValidator.validateSync(location)).toThrow()
  })

  test('ensure is valid when userId is not provided', async () => {
    //! Arrange
    const location = {
      longitude: 0,
      latitude: 0,
      userId: undefined,
    }
    const expected = { ...location, userId: '' }
    //! Act
    //! Assert
    expect(locationValidator.validateSync(expected)).toEqual(expected)
  })
})
