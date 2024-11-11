import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { UserControllerImpl } from './user-controller-impl'
import { LoadUseCases } from '@/app/_lib/config/load-use-cases'
import { User } from '@/app/_lib/core/domain/models/user'
import { InvalidJsonError } from '@/app/_lib/core/domain/errors/invalid-json-error'
import { userValidator } from '@/app/_lib/utils/validators/user-validator'

describe('user-controller-impl.test.ts - get', () => {
  let response: MockProxy<ApiResponse>
  let request: DeepMockProxy<Request>
  let loadUseCases: DeepMockProxy<LoadUseCases>
  let user: MockProxy<User>
  let sut: UserControllerImpl

  beforeEach(() => {
    response = mock<ApiResponse>()
    request = mockDeep<Request>()
    loadUseCases = mockDeep<LoadUseCases>()

    request.authorization = {
      userId: 'any_user_id',
    }

    user = mock<User>({
      id: 'any_id',
    })

    loadUseCases.getUserByIdUseCase.execute.mockResolvedValue(user)
    sut = new UserControllerImpl({ loadUseCases })
  })

  test('ensure return 401 if authorization.userId is undefined', async () => {
    //! Arrange
    request.authorization.userId = undefined
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'Unauthorized' })
  })

  test('ensure return 200 if user is found', async () => {
    //! Arrange
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(response.status).toBe(200)
    expect(response.body).toEqual(user)
  })

  test('ensure getUserByIdUseCase is called with correct value', async () => {
    //! Arrange
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(loadUseCases.getUserByIdUseCase.execute).toHaveBeenCalledWith(
      request.authorization.userId,
    )
  })

  test('ensure return 500 if getUserByIdUseCase throws', async () => {
    //! Arrange
    loadUseCases.getUserByIdUseCase.execute.mockRejectedValueOnce(new Error())
    const consoleError = jest.spyOn(console, 'error')
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(response.status).toBe(500)
    expect(response.body).toEqual({ message: 'Internal Server Error' })
    expect(consoleError).toHaveBeenCalled()
  })
})

describe('user-controller-impl.test.ts - put', () => {
  let response: MockProxy<ApiResponse>
  let request: DeepMockProxy<Request>
  let loadUseCases: DeepMockProxy<LoadUseCases>
  let user: MockProxy<User>
  let sut: UserControllerImpl

  beforeEach(() => {
    response = mock<ApiResponse>()
    request = mockDeep<Request>()
    loadUseCases = mockDeep<LoadUseCases>()

    request.authorization = {
      userId: 'any_id',
    }

    user = mock<User>({
      id: 'any_id',
      gender: 'male',
      genderInterest: 'female',
      name: 'any_name',
      birthdate: new Date('2003-01-01'),
      email: 'any@email',
      searchDistance: 100,
      images: [],
    })

    request.json.mockResolvedValue(user)

    loadUseCases.updateUserUseCase.execute.mockResolvedValue(user)
    sut = new UserControllerImpl({ loadUseCases })
  })

  test('ensure return 401 if authorization.userId is undefined', async () => {
    //! Arrange
    request.authorization.userId = undefined
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'Unauthorized' })
  })

  test('ensure return 400 if user is invalid', async () => {
    //! Arrange
    user.gender = 'invalid'
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
  })

  test('ensure return 400 if json is invalid', async () => {
    //! Arrange
    request.json.mockRejectedValueOnce(new InvalidJsonError())
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Invalid JSON' })
  })

  test('ensure return 401 if user.id is different from authorization.userId', async () => {
    //! Arrange
    request.authorization = {
      userId: 'any_user_id',
    }
    user.id = 'different_id'
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(loadUseCases.updateUserUseCase.execute).not.toHaveBeenCalled()
    expect(response.body).toEqual({ message: 'Forbidden' })
    expect(response.status).toBe(403)
  })

  test('ensure call updateUserUseCase with correct value', async () => {
    //! Arrange
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(loadUseCases.updateUserUseCase.execute).toHaveBeenCalledWith(
      userValidator.validateSync(user),
    )
  })

  test('ensure return updated user if user is updated', async () => {
    //! Arrange
    const updatedUser = mock<User>(user)
    updatedUser.name = 'updated_name'
    loadUseCases.updateUserUseCase.execute.mockResolvedValue(updatedUser)
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(200)
    expect(response.body).toEqual(updatedUser)
  })

  test('ensure throws if usecase throws a generic error', async () => {
    //! Arrange
    loadUseCases.updateUserUseCase.execute.mockRejectedValueOnce(new Error())
    //! Act
    //! Assert
    expect(sut.put(request, response)).rejects.toThrow()
  })
})
