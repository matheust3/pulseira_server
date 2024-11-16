export interface AuthService {
  /**
   * Logs a user in.
   * @param email - The email address of the user.
   * @param password - The password of the user.
   * @returns A promise that resolves with a token if the login is successful.
   * @throws An error if the login is unsuccessful.
   */
  login(email: string, password: string): Promise<string>;

  /**
   * Regenerates a token.
   * @param token - The token to regenerate.
   * @returns A promise that resolves with a token if the registration is successful.
   * @throws An error if the registration is unsuccessful.
   */
  regenerateToken(token: string): Promise<string>;
}
