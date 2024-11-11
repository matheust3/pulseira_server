import { GetTokenPayload } from './get-token-payload'

describe('get-token-payload.test.ts - execute', () => {
  let token: string
  let getTokenPayload: GetTokenPayload

  beforeEach(() => {
    token = makeToken()

    getTokenPayload = new GetTokenPayload()
  })

  // create a generic token without jwt library
  const makeToken = (): string => {
    const payload = {
      token: 'any_token',
    }
    const token = Buffer.from(JSON.stringify(payload)).toString('base64')
    return `any_header.${token}.any_signature`
  }

  test('ensure return token payload', async () => {
    //! Arrange
    //! Act
    const payload = await getTokenPayload.execute(token)
    //! Assert
    expect(payload.token).toBe('any_token')
  })
})
