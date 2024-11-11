import { ReorderImages } from '@/app/_lib/core/domain/usecases/images/reorder-images'
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { ReorderImagesControllerImpl } from './reorder-images-controller-impl'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { Image } from '@/app/_lib/core/domain/models/file/image'

describe('reorder-images-controller-impl.test.ts - put', () => {
  let reorderImagesUseCase: MockProxy<ReorderImages>
  let request: MockProxy<Request>
  let response: DeepMockProxy<ApiResponse>

  let sut: ReorderImagesControllerImpl

  beforeEach(() => {
    reorderImagesUseCase = mock<ReorderImages>()
    response = mockDeep<ApiResponse>()
    request = mock<Request>()
    request.authorization.userId = 'any_user_id'

    sut = new ReorderImagesControllerImpl({ reorderImagesUseCase })
  })

  test('ensure return 401 if user id is undefined', async () => {
    //! Arrange
    request.authorization.userId = undefined
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'User id is undefined' })
  })

  test('ensure return 400 if json is invalid', async () => {
    //! Arrange
    request.json.mockImplementation(() => {
      throw new Error()
    })
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'invalid json' })
  })

  test('ensure return 400 if images is required', async () => {
    //! Arrange
    request.json.mockResolvedValue([])
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'images is required' })
  })

  test('ensure return 400 if images is not an array', async () => {
    //! Arrange
    request.json.mockResolvedValue({ images: {} })
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'images must be an array' })
  })

  test('ensure return 400 if images is invalid', async () => {
    //! Arrange
    request.json.mockResolvedValue(['image1', 'image2'])
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'invalid image' })
  })

  test('ensure return 200 if reorderImagesUseCase is called with correct values', async () => {
    //! Arrange
    const image: Image = {
      id: 'any_id',
      orderId: 1,
      userId: 'any_user_id',
      url: 'any_url',
      flag: 'id',
    }
    request.json.mockResolvedValue([image])
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(reorderImagesUseCase.execute).toHaveBeenCalledWith('any_user_id', [
      image,
    ])
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Images reordered' })
  })
})
