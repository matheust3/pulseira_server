import { UserRepository } from '../../../application/gateways/user-repository'
import { User } from '../../models/user'

export class CreateUser {
  private readonly userRepository: UserRepository

  constructor(args: { userRepository: UserRepository }) {
    this.userRepository = args.userRepository
  }

  async execute(user: User): Promise<User> {
    return await this.userRepository.create(user)
  }
}
