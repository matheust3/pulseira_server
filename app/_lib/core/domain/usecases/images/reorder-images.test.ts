import { mock, MockProxy } from 'jest-mock-extended'
import { ImageRepository } from '../../../application/gateways/image-repository'
import { ReorderImages } from './reorder-images'
import { Image } from '../../models/file/image'

describe('reorder-images.test.ts - execute', () => {
  let imageRepository: MockProxy<ImageRepository>
  let sut: ReorderImages
  let images: Image[]

  beforeEach(() => {
    imageRepository = mock<ImageRepository>()

    images = [mock<Image>({ id: 'any_id', orderId: 1 })]

    sut = new ReorderImages({ imageRepository })
  })

  test('ensure call repository witch correct params', async () => {
    //! Arrange
    //! Act
    await sut.execute('any_user_id', images)
    //! Assert
    expect(imageRepository.reorderImages).toHaveBeenCalledWith(
      'any_user_id',
      images,
    )
  })

  test('ensure return void on success', async () => {
    //! Arrange
    //! Act
    const result = await sut.execute('any_user_id', images)
    //! Assert
    expect(result).toBeUndefined()
  })

  test('ensure throw if repository throws', async () => {
    //! Arrange
    imageRepository.reorderImages.mockRejectedValueOnce(new Error('any_error'))
    //! Act
    const promise = sut.execute('any_user_id', images)
    //! Assert
    await expect(promise).rejects.toThrow(new Error('any_error'))
  })
})
