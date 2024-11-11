import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { ImagesControllerImpl } from './images-controller-impl'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { PassThrough } from 'stream'
import { SaveImage } from '@/app/_lib/core/domain/usecases/images/save-image'
import { DeleteImage } from '@/app/_lib/core/domain/usecases/images/delete-image'

describe('save-image-controller-impl.test.ts - delete', () => {
  let deleteImageUseCase: MockProxy<DeleteImage>
  let sut: ImagesControllerImpl
  let request: MockProxy<Request>
  let response: DeepMockProxy<ApiResponse>

  beforeEach(() => {
    deleteImageUseCase = mock<DeleteImage>()
    deleteImageUseCase.execute.mockResolvedValue()
    response = mockDeep<ApiResponse>()
    request = mock<Request>()

    request.authorization = { userId: 'any_user_id' }
    request.searchParams = new URLSearchParams({ imageId: 'any_image_id' })

    sut = new ImagesControllerImpl({
      deleteImageUseCase,
      savaImageUseCase: mock<SaveImage>(),
    })
  })

  test('ensure call deleteImageUseCase with correct values', async () => {
    //! Arrange
    //! Act
    await sut.delete(request, response)
    //! Assert
    expect(deleteImageUseCase.execute).toHaveBeenCalledWith(
      'any_user_id',
      'any_image_id',
    )
  })

  test('ensure return 204 if everything goes right', async () => {
    //! Arrange
    //! Act
    await sut.delete(request, response)
    //! Assert
    expect(response.status).toBe(204)
    expect(response.body).toBeNull()
  })

  test('ensure return 400 if imageId is undefined', async () => {
    //! Arrange
    request.searchParams = new URLSearchParams({})
    //! Act
    await sut.delete(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'imageId is required' })
  })

  test('ensure return 401 if user id is undefined', async () => {
    //! Arrange
    request.authorization.userId = undefined
    //! Act
    await sut.delete(request, response)
    //! Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'User id is undefined' })
  })

  test('ensure return 404 if image not exists', async () => {
    //! Arrange
    deleteImageUseCase.execute.mockRejectedValueOnce(
      new Error('Image not found'),
    )
    //! Act
    await sut.delete(request, response)
    //! Assert
    expect(response.status).toBe(404)
    expect(response.body).toEqual({ error: 'Image not found' })
  })

  test('ensure throw if deleteImageUseCase throws', async () => {
    //! Arrange
    deleteImageUseCase.execute.mockRejectedValueOnce(new Error('Error'))
    //! Act
    const promise = sut.delete(request, response)
    //! Assert
    await expect(promise).rejects.toThrow(new Error('Error'))
  })
})

jest.mock('sharp', () => {
  const originalModule = jest.requireActual('sharp')
  return {
    __esModule: true,
    default: jest.fn(() => ({
      resize: jest.fn().mockReturnThis(),
      webp: jest.fn().mockImplementation(() => {
        return new PassThrough()
      }),
    })),
    fit: originalModule.fit,
  }
})

describe('save-image-controller-impl.test.ts - post', () => {
  let saveImageUseCase: MockProxy<SaveImage>
  let sut: ImagesControllerImpl
  let request: MockProxy<Request>
  let response: DeepMockProxy<ApiResponse>

  beforeEach(() => {
    saveImageUseCase = mock<SaveImage>()

    saveImageUseCase.execute.mockResolvedValue({
      id: 'any_id',
      orderId: 1,
      url: 'any_url',
      userId: 'any_user_id',
      flag: 'profile',
    })

    request = mock<Request>()
    request.headers = mock<Headers>({
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'content-type') return 'image/png'
        return null
      }),
    })
    request.authorization.userId = 'any_user_id'
    request.searchParams = new URLSearchParams({ flag: 'profile' })
    const smallData = Buffer.alloc(1 * 1024 * 1024) // 1 MB
    const readableStream = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(smallData)
        controller.close()
      },
    })
    request.body = readableStream

    response = mockDeep<ApiResponse>()

    sut = new ImagesControllerImpl({
      savaImageUseCase: saveImageUseCase,
      deleteImageUseCase: mock<DeleteImage>(),
    })
  })

  test('ensure return 400 if content-type is not in header', async () => {
    //! Arrange
    request.headers = mock<Headers>({
      get: jest.fn().mockReturnValue(null),
    })
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid content-type' })
  })

  test('ensure return 400 if content-type is not an image', async () => {
    //! Arrange
    request.headers = mock<Headers>({
      get: jest.fn().mockReturnValue('text/plain'),
    })
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid content-type' })
  })

  test('ensure return 401 is user id is undefined', async () => {
    //! Arrange
    request.authorization.userId = undefined
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ error: 'User id is undefined' })
  })

  test('ensure return 400 if body is bigger than 20MB', async () => {
    //! Arrange
    // Simule dados que excedem 20 MB
    const largeData = Buffer.alloc(21 * 1024 * 1024) // 21 MB

    // Mock the request body to be a stream that will write the large data
    const readableStream = new ReadableStream<Uint8Array>({
      start(controller): void {
        controller.enqueue(largeData)
        controller.close()
      },
    })
    request.body = readableStream
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'File size exceeds the limit' })
  })

  test('ensure call imageRepository.save with correct values', async () => {
    //! Arrange
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(saveImageUseCase.execute).toHaveBeenCalledWith(
      'any_user_id',
      expect.any(PassThrough),
      'profile',
    )
  })

  test('ensure return 200 and image if everything goes right', async () => {
    //! Arrange
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: 'any_id',
      url: 'any_url',
      orderId: 1,
      userId: 'any_user_id',
      flag: 'profile',
    })
  })

  test('ensure return 400 if flag is undefined', async () => {
    //! Arrange
    request.searchParams = new URLSearchParams({})
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'flag is required' })
  })

  test('ensure return 400 if flag is different from profile or id', async () => {
    //! Arrange
    request.searchParams = new URLSearchParams({ flag: 'invalid_flag' })
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'Invalid flag' })
  })

  test('ensure pass correct flag to saveImageUseCase', async () => {
    //! Arrange
    request.searchParams = new URLSearchParams({ flag: 'id' })
    //! Act
    await sut.post(request, response)
    //! Assert
    expect(saveImageUseCase.execute).toHaveBeenCalledWith(
      'any_user_id',
      expect.any(PassThrough),
      'id',
    )
  })
})
