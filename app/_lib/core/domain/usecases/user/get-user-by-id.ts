import { UserRepository } from '../../../application/gateways/user-repository'
import { User } from '../../models/user'

export class GetUserById {
  private readonly userRepository: UserRepository

  constructor(args: { userRepository: UserRepository }) {
    this.userRepository = args.userRepository
  }

  async execute(id: string): Promise<User | null> {
    return this.userRepository.getUserById(id)
  }
}
