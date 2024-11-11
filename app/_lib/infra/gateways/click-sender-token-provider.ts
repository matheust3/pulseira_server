import { PhoneTokenProvider } from '../../core/application/gateways/phone-token-provider'
import { PhoneToken } from '../../core/domain/models/phone-token'
import { randomUUID } from 'crypto'

export class ClickSenderTokenProvider implements PhoneTokenProvider {
  async generateToken(phoneNumber: string): Promise<PhoneToken> {
    // Token is a random alphanumeric uppercase string with 6 characters
    const token = Math.random().toString(36).substring(2, 8).toUpperCase()

    return {
      id: randomUUID(),
      phone: phoneNumber,
      token,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }

  async sendToken(token: PhoneToken): Promise<void> {
    const result = await fetch('https://rest.clicksend.com/v3/sms/send', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + process.env.CLICK_SEND_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            source: 'crm_api',
            body: 'crm token: ' + token.token,
            to: token.phone,
          },
        ],
      }),
    })

    if (!result.ok) {
      throw new Error('Failed to send token')
    } else {
      const response = await result.json()
      if (response.response_code !== 'SUCCESS') {
        throw new Error('Failed to send token -> ' + response.response_code)
      } else {
        if (
          response.data?.messages === undefined ||
          response.data.messages[0]?.status !== 'SUCCESS'
        ) {
          if (response.data?.messages?.[0] === undefined) {
            throw new Error('Failed to send token -> messages is undefined')
          } else {
            throw new Error(
              'Failed to send token -> ' + response.data.messages[0].status,
            )
          }
        }
      }
    }
  }
}
