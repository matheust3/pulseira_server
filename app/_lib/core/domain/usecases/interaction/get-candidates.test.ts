import { mock, MockProxy } from 'jest-mock-extended'
import { InteractionRepository } from '../../../application/gateways/interaction-repository'
import { GetCandidates } from './get-candidates'
import { Candidate } from '../../models/interaction/candidate'
import { Image } from '../../models/file/image'

describe('get-candidates.test.ts - execute', () => {
  let interactionRepositoryMock: MockProxy<InteractionRepository>
  let sut: GetCandidates
  let candidates: Candidate[]

  beforeEach(() => {
    interactionRepositoryMock = mock<InteractionRepository>()

    sut = new GetCandidates({
      interactionRepository: interactionRepositoryMock,
    })
    candidates = [
      {
        id: '1',
        description: 'Description 1',
        age: 30,
        gender: 'male',
        images: [{ url: 'image1.jpg' } as Image],
        distance: 10,
      },
      {
        id: '2',
        description: 'Description 2',
        age: 25,
        gender: 'female',
        images: [{ url: 'image2.jpg' } as Image],
        distance: 20,
      },
    ]
  })

  test('ensure call repository correctly', async () => {
    //! Arrange
    interactionRepositoryMock.getCandidates.mockResolvedValueOnce(candidates)
    //! Act
    const result = await sut.execute({ userId: 'test_user_id' })
    //! Assert
    expect(interactionRepositoryMock.getCandidates).toHaveBeenCalledWith(
      'test_user_id',
    )
    expect(result).toEqual(candidates)
  })

  test('ensure throws if repository throws', async () => {
    //! Arrange
    interactionRepositoryMock.getCandidates.mockRejectedValueOnce(
      new Error('repository_error'),
    )
    //! Act
    const promise = sut.execute({ userId: 'test_user_id' })
    //! Assert
    await expect(promise).rejects.toThrow(new Error('repository_error'))
  })

  test('ensure returns empty array if no candidates found', async () => {
    //! Arrange
    interactionRepositoryMock.getCandidates.mockResolvedValueOnce([])
    //! Act
    const result = await sut.execute({ userId: 'test_user_id' })
    //! Assert
    expect(interactionRepositoryMock.getCandidates).toHaveBeenCalled()
    expect(result).toEqual([])
  })

  test('ensure returns correct candidate data', async () => {
    //! Arrange
    interactionRepositoryMock.getCandidates.mockResolvedValueOnce(candidates)
    //! Act
    const result = await sut.execute({ userId: 'test_user_id' })
    //! Assert
    expect(result[0].id).toBe('1')
    expect(result[0].description).toBe('Description 1')
    expect(result[0].age).toBe(30)
    expect(result[0].gender).toBe('male')
    expect(result[0].images[0].url).toBe('image1.jpg')
    expect(result[0].distance).toBe(10)
  })
})
