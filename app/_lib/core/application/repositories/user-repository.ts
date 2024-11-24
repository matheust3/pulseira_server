import { User } from "../../domain/models/user";

export interface UserRepository {
  /**
   * Update the password of a user
   * @param id The ID of the user
   * @param password The new password
   */
  updatePassword(id: string, password: string): Promise<void>;
  /**
   * Find a user by email address
   * @param email Email of the user to find
   * @param options Options for the query (e.g. withPassHash)
   */
  findByEmail(email: string, options?: { withPassHash: boolean }): Promise<User>;

  /**
   * Find a user by ID
   * @param id ID of the user to find
   */
  findById(id: string): Promise<User>;

  /**
   * Create a new user
   * @param user Returns the user that was created
   */
  create(user: User): Promise<User>;

  /**
   * Update a user
   * @param user The user to update
   * @param organizationId The organization ID of the user
   */
  update(user: User, organizationId: string): Promise<User>;

  /**
   * Change password of a user
   * @param id The ID of the user
   * @param password The new password
   */
  changePassword(id: string, password: string): Promise<void>;

  /**
   * Get all users in an organization
   * @param organizationId The organization ID of the users
   */
  getAllInOrganization(organizationId: string): Promise<User[]>;
}
