import { PhoneToken } from '../../domain/models/phone-token'

export interface PhoneTokenRepository {
  /**
   * Save a phone token
   * @param token Token to save
   */
  save(token: PhoneToken): Promise<void>
}
