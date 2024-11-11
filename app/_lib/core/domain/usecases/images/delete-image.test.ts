import { mock, MockProxy } from 'jest-mock-extended'
import { ImageRepository } from '../../../application/gateways/image-repository'
import { DeleteImage } from './delete-image'

describe('delete-image.test.ts - execute', () => {
  let imageRepository: MockProxy<ImageRepository>
  let sut: DeleteImage

  beforeEach(() => {
    imageRepository = mock<ImageRepository>()

    sut = new DeleteImage({ imageRepository })
  })

  test('ensure call repository witch correct params', async () => {
    //! Arrange
    //! Act
    await sut.execute('userId', 'imageId')
    //! Assert
    expect(imageRepository.delete).toHaveBeenCalledWith('userId', 'imageId')
  })

  test('ensure throw if repository throws', async () => {
    //! Arrange
    imageRepository.delete.mockRejectedValueOnce(new Error('Repository error'))
    //! Act
    const promise = sut.execute('userId', 'imageId')
    //! Assert
    await expect(promise).rejects.toThrow(new Error('Repository error'))
  })
})
