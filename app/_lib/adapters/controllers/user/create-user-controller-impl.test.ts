import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { DeepMockProxy, MockProxy, mock, mockDeep } from 'jest-mock-extended'
import { CreateUserControllerImpl } from './create-user-controller-impl'
import { CreateUser } from '@/app/_lib/core/domain/usecases/user/create-user'
import { User } from '@/app/_lib/core/domain/models/user'
import { userValidator } from '@/app/_lib/utils/validators/user-validator'
import { GetAccountStatus } from '@/app/_lib/core/domain/usecases/account/get-account-status'
import { AccountStatus } from '@/app/_lib/core/domain/models/account-status'
import { GetEmailFromToken } from '@/app/_lib/core/domain/usecases/authentication/get-email-from-token'

describe('create-user-controller-impl.test.ts - put', () => {
  let response: MockProxy<ApiResponse>
  let request: DeepMockProxy<Request>
  let createUserUseCase: MockProxy<CreateUser>
  let getAccountStatusUseCase: MockProxy<GetAccountStatus>
  let getEmailFromTokenUseCase: MockProxy<GetEmailFromToken>
  let accountStatus: MockProxy<AccountStatus>
  let user: User
  let sut: CreateUserControllerImpl

  beforeEach(() => {
    response = mock<ApiResponse>()
    request = mockDeep<Request>()
    user = {
      birthdate: new Date('2000-01-01'),
      email: '',
      name: 'any_name',
      id: 'any_id',
      gender: 'male',
      genderInterest: 'female',
      description: 'description',
      searchDistance: 0,
      images: [],
    }
    accountStatus = mock<AccountStatus>({ basicInformation: false })
    request.json.mockResolvedValue({ user })
    request.headers.get.mockReturnValue('Bearer token')
    createUserUseCase = mock<CreateUser>()
    getAccountStatusUseCase = mock<GetAccountStatus>()
    getAccountStatusUseCase.execute.mockResolvedValue(accountStatus)
    getEmailFromTokenUseCase = mock<GetEmailFromToken>()
    getEmailFromTokenUseCase.execute.mockResolvedValue('email@domain.com')

    sut = new CreateUserControllerImpl({
      createUserUseCase,
      getAccountStatusUseCase,
      getEmailFromTokenUseCase,
    })
  })

  test('ensure return 400 if json is invalid ', async () => {
    //! Arrange
    request.json.mockRejectedValueOnce(new Error('invalid json'))
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.status).toBe(400)
    expect(response.body).toEqual({ error: 'invalid json' })
  })

  test('ensure return 400 if user is invalid ', async () => {
    //! Arrange
    user.gender = 'invalid gender'
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.body).toEqual({
      error: 'gender must match the following: "/(male|female)/"',
    })
    expect(response.status).toBe(400)
  })

  test('ensure set default search distance to 100', async () => {
    //! Arrange
    request.json.mockResolvedValue({
      user: { ...user, searchDistance: undefined },
    })
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(createUserUseCase.execute).toHaveBeenCalledWith({
      ...user,
      email: 'email@domain.com',
      searchDistance: 100,
    })
  })

  test('ensure return 500 if get email from token throws error', async () => {
    //! Arrange
    const error = Error('any error')
    getEmailFromTokenUseCase.execute.mockRejectedValueOnce(error)
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.body).toEqual({ error: 'internal server error' })
    expect(response.status).toBe(500)
  })

  test('ensure return 500 if validator throws any another error', async () => {
    //! Arrange
    user.email = 'invalid-email'
    const error = Error('any error')
    const userV = jest.spyOn(userValidator, 'validateSync')
    userV.mockImplementationOnce(() => {
      throw error
    })
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.body).toEqual({ error: 'internal server error' })
    expect(response.status).toBe(500)
  })

  test('ensure call createUserUseCase with correct values', async () => {
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(createUserUseCase.execute).toHaveBeenCalledWith(user)
  })

  test('ensure get account status', async () => {
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(getAccountStatusUseCase.execute).toHaveBeenCalledWith('token')
  })

  test('ensure return 401 if token is not provided', async () => {
    //! Arrange
    request.headers.get.mockReturnValue(null)
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.body).toEqual({ error: 'unauthorized' })
    expect(response.status).toBe(401)
  })

  test('ensure return 409 if account already exists', async () => {
    //! Arrange
    accountStatus.basicInformation = true
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.body).toEqual({ error: 'account already exists' })
    expect(response.status).toBe(409)
  })

  test('ensure return created user', async () => {
    //! Arrange
    const createdUser = { ...user, id: 'created_id' }
    createUserUseCase.execute.mockResolvedValue(createdUser)
    //! Act
    await sut.put(request, response)
    //! Assert
    expect(response.body).toEqual({ user: createdUser })
    expect(response.status).toBe(201)
  })
})
