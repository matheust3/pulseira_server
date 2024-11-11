import { PhoneToken } from '../../domain/models/phone-token'

export interface PhoneTokenProvider {
  /**
   * Generate a token for a phone number
   * @param phoneNumber Number to generate token for
   * @returns Generated token
   */
  generateToken(phoneNumber: string): Promise<PhoneToken>
  /**
   * Send a token to a phone number
   * @param token Token to send
   */
  sendToken(token: PhoneToken): Promise<void>
}
