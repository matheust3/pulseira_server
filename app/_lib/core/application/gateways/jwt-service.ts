export interface JwtService {
  /**
   * Generate a JWT token
   * @param payload - The payload to be included in the token
   * @param expiresIn - The expiration time of the token
   * @returns The generated token
   * @throws {Error} If the token could not be generated
   */
  generateToken(payload: object, expiresIn: string): Promise<string>;

  /**
   * Validate a JWT token
   * @param token - The token to be validated
   * @returns The payload of the token
   * @throws {Error} If the token is invalid
   */
  validateToken(token: string): Promise<object>;

  /**
   * Generate a refresh token
   * @param token - The token to be refreshed
   * @param expiresIn - The expiration time of the token
   * @returns The generated token
   * @throws {Error} If the token could not be generated
   */
  generateRefreshToken(token: string, expiresIn: string): Promise<string>;
}
