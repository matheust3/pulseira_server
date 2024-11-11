import { UserRepository } from '../../../application/gateways/user-repository'
import { User } from '../../models/user'

export class UpdateUser {
  readonly userRepository: UserRepository

  constructor(args: { userRepository: UserRepository }) {
    this.userRepository = args.userRepository
  }

  async execute(user: Partial<User>): Promise<User> {
    return await this.userRepository.update(user)
  }
}
