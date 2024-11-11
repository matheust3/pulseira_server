import { MockProxy, mock } from 'jest-mock-extended'
import { PhoneToken } from '../../core/domain/models/phone-token'
import { ClickSenderTokenProvider } from './click-sender-token-provider'
import { NextResponse } from 'next/server'

describe('click-sender-token-provider.test.ts - generateToken', () => {
  interface SutTypes {
    sut: ClickSenderTokenProvider
  }

  const makeSut = (): SutTypes => {
    const sut = new ClickSenderTokenProvider()
    return { sut }
  }

  test('ensure token as 6 digits', async () => {
    //! Arrange
    const { sut } = makeSut()
    //! Act
    const token = await sut.generateToken('phone number')
    //! Assert
    expect(token.token.length).toBe(6)
  })

  test('ensure token is alphanumeric', async () => {
    //! Arrange
    const { sut } = makeSut()
    //! Act
    const token = await sut.generateToken('phone number')
    //! Assert
    expect(token.token).toMatch(/^[a-zA-Z0-9]*$/)
  })

  test('ensure dates is database format', async () => {
    //! Arrange
    const { sut } = makeSut()
    //! Act
    const token = await sut.generateToken('phone number')
    //! Assert
    expect(token.createdAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
    )
    expect(token.updatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
    )
  })

  test('ensure create only uppercase tokens', async () => {
    //! Arrange
    const { sut } = makeSut()
    //! Act
    const token = await sut.generateToken('phone number')
    //! Assert
    expect(token.token).toBe(token.token.toUpperCase())
  })
})

describe('click-sender-token-provider.test.ts - sendToken', () => {
  let sut: ClickSenderTokenProvider
  let token: MockProxy<PhoneToken>
  let fetchSpy: jest.SpyInstance
  let mockResponse: MockProxy<NextResponse>

  beforeEach(() => {
    sut = new ClickSenderTokenProvider()
    token = mock<PhoneToken>()
    mockResponse = mock<NextResponse>({ ok: true })
    mockResponse.json.mockResolvedValue({
      response_code: 'SUCCESS',
      data: {
        messages: [
          {
            status: 'SUCCESS',
          },
        ],
      },
    })
    fetchSpy = jest.spyOn(global, 'fetch')
    fetchSpy.mockResolvedValue(mockResponse)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('ensure throws if api response is not ok', async () => {
    //! Arrange
    mockResponse = mock<NextResponse>({ ok: false })
    fetchSpy.mockResolvedValue(mockResponse)
    //! Act
    //! Assert
    expect(sut.sendToken(token)).rejects.toThrow('Failed to send token')
  })

  test('ensure throws if response_code is not SUCCESS', async () => {
    //! Arrange
    mockResponse = mock<NextResponse>({ ok: true })
    mockResponse.json.mockResolvedValue({
      response_code: 'ERROR',
    })
    fetchSpy.mockResolvedValue(mockResponse)
    //! Act
    //! Assert
    expect(sut.sendToken(token)).rejects.toThrow('Failed to send token')
  })

  test('ensure throws if message status is not success', async () => {
    //! Arrange
    mockResponse = mock<NextResponse>({ ok: true })
    mockResponse.json.mockResolvedValue({
      response_code: 'SUCCESS',
      data: {
        messages: [
          {
            status: 'ERROR',
          },
        ],
      },
    })
    fetchSpy.mockResolvedValue(mockResponse)
    //! Act
    //! Assert
    expect(sut.sendToken(token)).rejects.toThrow(
      'Failed to send token -> ERROR',
    )
  })

  test('ensure throws if messages array is empty', async () => {
    //! Arrange
    mockResponse = mock<NextResponse>({ ok: true })
    mockResponse.json.mockResolvedValue({
      response_code: 'SUCCESS',
      data: {
        messages: [],
      },
    })
    fetchSpy.mockResolvedValue(mockResponse)
    //! Act
    //! Assert
    expect(sut.sendToken(token)).rejects.toThrow(
      'Failed to send token -> messages is undefined',
    )
  })

  test('ensure throws if messages is undefined', async () => {
    //! Arrange
    mockResponse = mock<NextResponse>({ ok: true })
    mockResponse.json.mockResolvedValue({
      response_code: 'SUCCESS',
      data: {},
    })
    fetchSpy.mockResolvedValue(mockResponse)
    //! Act
    //! Assert
    expect(sut.sendToken(token)).rejects.toThrow(
      'Failed to send token -> messages is undefined',
    )
  })

  test('ensure call fetch with correct params', async () => {
    //! Arrange
    token.token = '123456'
    token.phone = '+55999999999'
    //! Act
    await sut.sendToken(token)
    //! Assert
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://rest.clicksend.com/v3/sms/send',
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + process.env.CLICK_SEND_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              source: 'crm_api', // Pode substituir 'php' pelo identificador mais adequado para seu uso
              body: 'crm token: 123456',
              to: '+55999999999',
            },
          ],
        }),
      },
    )
  })
})
