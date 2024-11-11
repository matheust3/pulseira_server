import { CandidatesControllerImpl } from './candidates-controller-impl'
import { GetCandidates } from '@/app/_lib/core/domain/usecases/interaction/get-candidates'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { DeepMockProxy, mock, mockDeep, MockProxy } from 'jest-mock-extended'
import { Candidate } from '@/app/_lib/core/domain/models/interaction/candidate'

describe('CandidatesControllerImpl', () => {
  let getCandidates: MockProxy<GetCandidates>
  let candidatesController: CandidatesControllerImpl
  let request: DeepMockProxy<Request>
  let response: MockProxy<ApiResponse>

  beforeEach(() => {
    getCandidates = mock<GetCandidates>()
    candidatesController = new CandidatesControllerImpl({ getCandidates })
    request = mockDeep<Request>()
    response = mock<ApiResponse>()
  })

  test('should return 401 if user is not authorized', async () => {
    //! Arrange
    request.authorization.userId = undefined
    //! Act
    await candidatesController.get(request, response)
    //! Assert
    expect(response.status).toBe(401)
    expect(response.body).toEqual({ message: 'Unauthorized' })
  })

  test('should return 200 and candidates if user is authorized', async () => {
    //! Arrange
    request.authorization = { userId: 'user123' }
    const candidates = [
      mock<Candidate>({ id: 'candidate1' }),
      mock<Candidate>({ id: 'candidate2' }),
    ]
    getCandidates.execute.mockResolvedValue(candidates)
    //! Act
    await candidatesController.get(request, response)
    //! Assert
    expect(response.status).toBe(200)
    expect(response.body).toEqual(candidates)
  })
})
