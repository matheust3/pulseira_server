import { MockProxy, mock, mockDeep } from 'jest-mock-extended'
import { SendPhoneTokenUseCase } from '../../core/domain/usecases/phone-token/send-usecase'
import { PhoneTokenController } from '../../core/application/controllers/phone-token-controller'
import { NextPhoneTokenController } from './next-phone-token-controller'
import { NextRequest, NextResponse } from 'next/server'

interface SutTypes {
  sut: PhoneTokenController
  sendTokenUseCaseStub: MockProxy<SendPhoneTokenUseCase>
}

const makeSut = (): SutTypes => {
  const sendTokenUseCaseStub = mock<SendPhoneTokenUseCase>()
  const sut = new NextPhoneTokenController(sendTokenUseCaseStub)
  return {
    sut,
    sendTokenUseCaseStub,
  }
}

describe('next-phone-token-controller', () => {
  test('should return 400 if phone is not provided', async () => {
    //! Arrange
    const { sut, sendTokenUseCaseStub } = makeSut()
    const req = mock<NextRequest>({
      json: jest.fn().mockResolvedValue({ anyData: undefined }),
    })
    const response = NextResponse.json(
      { error: 'Phone is required' },
      { status: 400 },
    )
    //! Act
    const result = await sut.send(req)
    //! Assert
    expect(result.status).toEqual(response.status)
    expect(sendTokenUseCaseStub.send).not.toHaveBeenCalled()
    expect(await result.json()).toEqual({ error: 'Phone is required' })
  })

  test('ensure call usecase with correct values', async () => {
    //! Arrange
    const { sut, sendTokenUseCaseStub } = makeSut()

    const req = mock<NextRequest>({
      json: jest.fn().mockResolvedValue({ phone: '1234567890' }),
    })
    //! Act
    await sut.send(req)
    //! Assert
    expect(sendTokenUseCaseStub.send).toHaveBeenCalledWith('1234567890')
  })

  test('ensure return 200 if phone has provided', async () => {
    //! Arrange
    const { sut } = makeSut()
    const req = mock<NextRequest>({
      json: jest.fn().mockResolvedValue({ phone: '1234567890' }),
    })
    const response = NextResponse.json(
      { message: 'Token sent' },
      { status: 200 },
    )
    //! Act
    const result = await sut.send(req)
    //! Assert
    expect(result.status).toEqual(response.status)
    expect(await result.json()).toEqual({ message: 'Token sent' })
  })

  test('ensure return 400 if body as no json', async () => {
    //! Arrange
    const { sut } = makeSut()
    const req = mockDeep<NextRequest>()
    req.json.mockRejectedValueOnce(new Error('invalid json'))
    //! Act
    const result = await sut.send(req)
    //! Assert
    expect(result.status).toEqual(400)
    expect(await result.json()).toEqual({ error: 'A json is required' })
  })
})
