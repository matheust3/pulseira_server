export interface UserRepository {
  updatePassword(email: string, password: string): Promise<void>;
}
