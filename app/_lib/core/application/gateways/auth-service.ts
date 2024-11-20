import { AuthToken } from "../../domain/models/authentication/AuthToken";
import { User } from "../../domain/models/user";

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

  /**
   * Verifies a token.
   * @param token - The token to verify.
   * @returns A promise that resolves with the token payload if the token is valid.
   * @throws An error if the token is invalid.
   */
  verifyToken(token: string): Promise<AuthToken<User>>;
}
