import { MockProxy } from 'jest-mock-extended'
import { Image } from '../../core/domain/models/file/image'
import { imageValidator } from './image-validator'

describe('image-validator.test.ts - validate', () => {
  let image: MockProxy<Image>

  beforeEach(() => {
    image = {
      id: 'any id',
      orderId: 1,
      userId: 'any user id',
      url: 'any url',
      flag: 'id',
    }
  })

  test('ensure return not valid if orderId is a string', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, orderId: '1d' })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if orderId is undefined', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, orderId: undefined })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if orderId is null', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, orderId: null })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if userId is a number', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync(
      { ...image, userId: 1 },
      { strict: true },
    )
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if userId is undefined', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, userId: undefined })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if userId is null', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, userId: null })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if url is a number', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync(
      { ...image, url: 1 },
      { strict: true },
    )
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if url is undefined', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, url: undefined })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if url is null', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, url: null })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if flag is a number', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync(
      { ...image, flag: 1 },
      { strict: true },
    )
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if flag is undefined', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, flag: undefined })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if flag is null', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, flag: null })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return not valid if flag is not id or profile', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync({ ...image, flag: 'any' })
    //! Assert
    expect(valid).toBe(false)
  })

  test('ensure return valid if all fields are correct', async () => {
    //! Arrange
    //! Act
    const valid = imageValidator.isValidSync(image)
    //! Assert
    expect(valid).toBe(true)
  })
})
