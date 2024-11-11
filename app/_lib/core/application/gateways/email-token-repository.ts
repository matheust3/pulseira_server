import { EmailToken } from '../../domain/models/email-token'

export interface EmailTokenRepository {
  /**
   * Finds an email token by email and token.
   * @param email - The email address to find the token for.
   * @param token - The token to find.
   * @returns A promise that resolves with the email token entity if found.
   * @throws An error if the email token could not be found.
   */
  findEmailToken(email: string, token: string): Promise<EmailToken | null>

  /**
   * Finds an email token by token ID.
   * @param tokenId - The ID of the email token to find.
   * @returns A promise that resolves with the email token entity if found or null if not found.
   */
  findTokenById(tokenId: string): Promise<EmailToken | null>

  /**
   * Creates an email token.
   * @param email - The email address to create the token for.
   * @param token - The token to create.
   * @returns A promise that resolves with the created email token entity.
   * @throws An error if the email token could not be created.
   */
  createEmailToken(email: string, token: string): Promise<EmailToken>

  /**
   * Sets an email token as verified.
   * @param tokenId - The ID of the email token to set as verified.
   * @returns A promise that resolves when the email token has been set as verified.
   * @throws An error if the email token could not be set as verified.
   */
  setAsVerified(tokenId: string): Promise<void>
}
