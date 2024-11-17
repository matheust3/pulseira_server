import { User } from "../../domain/models/user";

export interface UserRepository {
  updatePassword(email: string, password: string): Promise<void>;
  /**
   * Find a user by email address
   * @param email Email of the user to find
   * @param options Options for the query (e.g. withPassHash)
   */
  findByEmail(email: string, options?: { withPassHash: boolean }): Promise<User>;

  /**
   * Create a new user
   * @param user Returns the user that was created
   */
  create(user: User): Promise<User>;
}
