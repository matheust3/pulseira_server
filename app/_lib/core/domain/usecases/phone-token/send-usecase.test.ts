import { PhoneTokenProvider } from '../../../application/gateways/phone-token-provider'
import { PhoneTokenRepository } from '../../../application/gateways/phone-token-repository'
import { PhoneToken } from '../../models/phone-token'
import { SendPhoneTokenUseCase } from './send-usecase'
import { MockProxy, mock } from 'jest-mock-extended'

interface SutTypes {
  sut: SendPhoneTokenUseCase
  phoneTokenRepositorySpy: MockProxy<PhoneTokenRepository>
  phoneTokenProviderSpy: MockProxy<PhoneTokenProvider>
  token: MockProxy<PhoneToken>
}

const makeSUT = (): SutTypes => {
  const token = mock<PhoneToken>({
    token: 'token',
    phone: '123456789',
  })

  const phoneTokenRepositorySpy = mock<PhoneTokenRepository>()
  const phoneTokenProviderSpy = mock<PhoneTokenProvider>()
  phoneTokenProviderSpy.generateToken.mockResolvedValue(token)

  const sut = new SendPhoneTokenUseCase(
    phoneTokenRepositorySpy,
    phoneTokenProviderSpy,
  )
  return { sut, phoneTokenProviderSpy, phoneTokenRepositorySpy, token }
}

describe('send-usecase.spec.ts - ', () => {
  test('ensure generate token', () => {
    //! Arrange
    const { sut, phoneTokenProviderSpy } = makeSUT()
    //! Act
    sut.send('123456789')
    //! Assert
    expect(phoneTokenProviderSpy.generateToken).toHaveBeenCalledWith(
      '123456789',
    )
  })

  test('ensure sava token', async () => {
    //! Arrange
    const { sut, phoneTokenRepositorySpy, token } = makeSUT()
    //! Act
    await sut.send('123456789')
    //! Assert
    expect(phoneTokenRepositorySpy.save).toHaveBeenCalledWith(token)
  })

  test('ensure send token', async () => {
    //! Arrange
    const { sut, phoneTokenProviderSpy, token } = makeSUT()
    //! Act
    await sut.send('123456789')
    //! Assert
    expect(phoneTokenProviderSpy.sendToken).toHaveBeenCalledWith(token)
  })
})
