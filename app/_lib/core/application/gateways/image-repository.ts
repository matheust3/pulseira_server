import { PassThrough } from 'stream'
import { Image } from '../../domain/models/file/image'

export interface ImageRepository {
  /**
   * Delete a image from the repository
   * @param userId Id of the user who is deleting the image
   * @param imageId Id of the image to be deleted
   * @returns Promise<void>
   */
  delete(userId: string, imageId: string): Promise<void>

  /**
   * Get url image by file key
   * @param fileKey Key of the image file
   * @returns The image url
   */
  getImageUrlByFileKey(fileKey: string): Promise<string>

  /**
   * Reordena images in the repository by the orderId
   * @param userId Id of the user who is reordering the images
   * @param images Images to be reordered
   * @returns Promise<void>
   */
  reorderImages(userId: string, images: Image[]): Promise<void>

  /**
   * Save a image to the repository
   * NOTE: Only accepts images with mime type 'image/webp'
   * @param userId Id of the user who is uploading the image
   * @param stream Stream of the image to be uploaded
   * @param flag Flag of the image
   * @returns The image that was saved
   */
  save(userId: string, stream: PassThrough, flag: Image['flag']): Promise<Image>
}
