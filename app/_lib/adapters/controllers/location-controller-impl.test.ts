import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { ApiResponse } from '../../core/domain/models/routes/api-response'
import { Request } from '../../core/domain/models/routes/request'
import { LoadUseCases } from '../../config/load-use-cases'
import { LocationControllerImpl } from './location-controller-impl'
import { InvalidJsonError } from '../../core/domain/errors/invalid-json-error'

describe('location-controller-impl.test.ts - put', () => {
  let response: MockProxy<ApiResponse>
  let request: DeepMockProxy<Request>
  let loadUseCases: DeepMockProxy<LoadUseCases>
  let sut: LocationControllerImpl

  beforeEach(() => {
    response = mock<ApiResponse>()
    request = mockDeep<Request>()
    loadUseCases = mockDeep<LoadUseCases>()

    request.authorization = {
      userId: 'any_id',
    }

    sut = new LocationControllerImpl({
      saveLocationUseCase: loadUseCases.saveLocationUseCase,
    })
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

  test('ensure return 400 if request.body is not valid json', async () => {
    //! Arrange
    request.json.mockRejectedValueOnce(new InvalidJsonError())
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Invalid request' })
  })

  test('ensure return 400 if request.body is not valid location', async () => {
    //! Arrange
    request.json.mockResolvedValueOnce({})
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ message: 'Invalid request' })
  })

  test('ensure throws if generic error', async () => {
    //! Arrange
    request.json.mockRejectedValueOnce(new Error())
    //! Act
    //! Assert
    await expect(sut.put(request, response)).rejects.toThrow()
  })

  test('ensure call saveLocationUseCase with correct values', async () => {
    //! Arrange
    const location = {
      latitude: 0,
      longitude: 0,
    }
    request.json.mockResolvedValueOnce(location)
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(loadUseCases.saveLocationUseCase.execute).toHaveBeenCalledWith({
      ...location,
      userId: request.authorization.userId,
    })
    expect(response.status).toEqual(204)
    expect(response.body).toBeNull()
  })
})
