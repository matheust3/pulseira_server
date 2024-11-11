export class MaxImagesError extends Error {
  constructor() {
    super('User can only have 12 images')
    this.name = 'MaxImagesError'
  }
}
