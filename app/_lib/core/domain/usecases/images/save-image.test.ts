import { mock, MockProxy } from 'jest-mock-extended'
import { ImageRepository } from '../../../application/gateways/image-repository'
import { SaveImage } from './save-image'
import { PassThrough } from 'stream'
import { Image } from '../../models/file/image'

describe('save-image.test.ts - execute', () => {
  let imageRepository: MockProxy<ImageRepository>
  let image: Image
  let sut: SaveImage

  beforeEach(() => {
    imageRepository = mock<ImageRepository>()
    image = {
      id: 'any_id',
      orderId: 1,
      url: 'any_url',
      userId: 'any_user_id',
      flag: 'profile',
    }
    imageRepository.save.mockResolvedValue(image)

    sut = new SaveImage({ imageRepository })
  })

  test('ensure call repository with correct params', async () => {
    //! Arrange
    //! Act
    await sut.execute('any_user_id', new PassThrough(), 'profile')
    //! Assert
    expect(imageRepository.save).toHaveBeenCalledWith(
      'any_user_id',
      expect.any(PassThrough),
      'profile',
    )
  })

  test('ensure return image', async () => {
    //! Arrange
    //! Act
    const result = await sut.execute(
      'any_user_id',
      new PassThrough(),
      'profile',
    )
    //! Assert
    expect(result).toEqual(image)
  })

  test('ensure throw if repository throws', async () => {
    //! Arrange
    imageRepository.save.mockRejectedValueOnce(new Error('any_error'))
    //! Act
    const promise = sut.execute('any_user_id', new PassThrough(), 'profile')
    //! Assert
    await expect(promise).rejects.toThrow(new Error('any_error'))
  })
})
