import { MockProxy } from 'jest-mock-extended'
import { User } from '../../core/domain/models/user'
import { userValidator } from './user-validator'

describe('user-validator.test.ts - validate', () => {
  let user: MockProxy<User>

  beforeEach(() => {
    user = {
      id: 'any id',
      email: 'email@domain.com',
      name: 'any name',
      searchDistance: 100,
      birthdate: new Date(new Date().getFullYear() - 18 + '-01-01'),
      gender: 'male',
      genderInterest: 'female',
      description: 'any description',
      images: [],
    }
  })

  test('ensure not user is invalide if age is lass than 18', async () => {
    //! Arrange
    user.birthdate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 365 * 17)
    const error = Error(
      'birthdate must be greater than or equal to 18 years old',
    )
    //! Act
    //! Assert
    expect(() => userValidator.validateSync(user)).toThrow(error)
  })

  test('ensure not user is invalide if age is lass than 18', async () => {
    //! Arrange
    //! Act
    const res = userValidator.validateSync(user)
    //! Assert
    expect(res).toEqual(user)
  })

  test('ensure description can be empty but not null or undefined', async () => {
    //! Arrange
    user.description = ''
    //! Act
    const res = userValidator.validateSync(user)
    //! Assert
    expect(res).toEqual(user)
  })

  test('ensure not user is invalide is email is invalid', async () => {
    //! Arrange
    user.email = 'invalid-email'
    const error = Error('email must be a valid email')
    //! Act
    //! Assert
    expect(() => userValidator.validateSync(user)).toThrow(error)
  })

  test('ensure throws if description is greater than 500 characters', async () => {
    //! Arrange
    user.description = 'a'.repeat(501)
    const error = Error('description must be at most 500 characters')
    //! Act
    //! Assert
    expect(() => userValidator.validateSync(user)).toThrow(error)
  })

  test('ensure throws if searchDistance is undefined', async () => {
    //! Arrange
    const u = { ...user, searchDistance: undefined }
    delete u.searchDistance
    const error = Error('searchDistance is a required field')
    //! Act
    //! Assert
    expect(() => userValidator.validateSync(u)).toThrow(error)
  })

  test('ensure throws if searchDistance is greater than 200', async () => {
    //! Arrange
    user.searchDistance = 201
    const error = Error('searchDistance must be less than or equal to 200')
    //! Act
    //! Assert
    expect(() => userValidator.validateSync(user)).toThrow(error)
  })
})
