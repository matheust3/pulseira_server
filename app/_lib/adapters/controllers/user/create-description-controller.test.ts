import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { CreateDescriptionControllerImpl } from './create-description-controller'
import { UpdateUser } from '@/app/_lib/core/domain/usecases/user/update-user'
import { User } from '@/app/_lib/core/domain/models/user'

describe('create-description-controller.test.ts - put', () => {
  let response: MockProxy<ApiResponse>
  let request: DeepMockProxy<Request>
  let updateUserUseCase: MockProxy<UpdateUser>
  let userUpdated: MockProxy<User>

  let sut: CreateDescriptionControllerImpl

  beforeEach(() => {
    response = mock<ApiResponse>()
    userUpdated = mockDeep<User>()
    request = mockDeep<Request>({ authorization: { userId: 'any id' } })
    request.json.mockResolvedValue({ description: 'any description' })
    updateUserUseCase = mock<UpdateUser>()
    updateUserUseCase.execute.mockResolvedValue(userUpdated)

    sut = new CreateDescriptionControllerImpl({
      updateUserUseCase,
    })
  })

  test('ensure return 400 if user id is undefined', async () => {
    //! Arrange
    request.authorization.userId = undefined
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toEqual(401)
    expect(response.body).toEqual({ message: 'User id is required' })
  })

  test('ensure return 400 if request.json throws an error', async () => {
    //! Arrange
    request.json.mockRejectedValue(new Error('any error'))
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ message: 'Invalid json' })
  })

  test('ensure return 400 if description is undefined', async () => {
    //! Arrange
    request.json.mockResolvedValue({})
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toEqual(400)
    expect(response.body).toEqual({ message: 'description is required' })
  })

  test('ensure call updateUserUseCase with correct values', async () => {
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(updateUserUseCase.execute).toHaveBeenCalledWith({
      id: 'any id',
      description: 'any description',
    })
  })

  test('ensure return 500 if updateUserUseCase throws an error', async () => {
    //! Arrange
    updateUserUseCase.execute.mockRejectedValue(new Error('any error'))
    const error = jest.spyOn(global.console, 'error').mockImplementation()
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toEqual(500)
    expect(response.body).toEqual({ message: 'Internal server error' })
    expect(error).toHaveBeenCalled()
  })

  test('ensure return user updated', async () => {
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toEqual(201)
    expect(response.body).toEqual(userUpdated)
  })
})
