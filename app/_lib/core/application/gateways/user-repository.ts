import { User } from '../../domain/models/user'

export interface UserRepository {
  create(user: User): Promise<User>
  getUserById(id: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  update(user: Partial<User>): Promise<User>
}
