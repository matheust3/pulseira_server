import { GetAccountStatus } from '@/app/_lib/core/domain/usecases/account/get-account-status'
import { DeepMockProxy, MockProxy, mock, mockDeep } from 'jest-mock-extended'
import { GetAccountStatusController } from './get-account-status-controller'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { AccountStatus } from '@/app/_lib/core/domain/models/account-status'

describe('get-account-status-controller.test.ts - get', () => {
  let getAccountStatusUseCase: MockProxy<GetAccountStatus>
  let sut: GetAccountStatusController
  let request: DeepMockProxy<Request>
  let response: ApiResponse
  let accountStatus: MockProxy<AccountStatus>

  beforeEach(() => {
    accountStatus = mock<AccountStatus>()
    request = mockDeep<Request>()
    request.headers.get.mockReturnValue('beer any_token')
    response = mock<ApiResponse>()

    getAccountStatusUseCase = mock<GetAccountStatus>()
    getAccountStatusUseCase.execute.mockResolvedValue(accountStatus)
    sut = new GetAccountStatusController({ getAccountStatusUseCase })
  })

  test('ensure call usecase with correct params', async () => {
    //! Arrange
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(getAccountStatusUseCase.execute).toHaveBeenCalledWith('any_token')
  })

  test('ensure response is unauthorized if token not split', async () => {
    //! Arrange
    request.headers.get.mockReturnValue('token_no_split')
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(response.body).toEqual({ error: 'unauthorized' })
    expect(response.status).toBe(401)
  })

  test('ensure response is unauthorized if token is null', async () => {
    //! Arrange
    request.headers.get.mockReturnValue(null)
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(response.body).toEqual({ error: 'unauthorized' })
    expect(response.status).toBe(401)
  })

  test('ensure account status to response', async () => {
    //! Arrange
    //! Act
    await sut.get(request, response)
    //! Assert
    expect(response.body).toEqual(accountStatus)
    expect(response.status).toBe(200)
  })

  test('ensure throws if usecase throws', async () => {
    //! Arrange
    getAccountStatusUseCase.execute.mockRejectedValue(new Error('any_error'))
    //! Act
    //! Assert
    expect(sut.get(request, response)).rejects.toThrow('any_error')
  })
})
