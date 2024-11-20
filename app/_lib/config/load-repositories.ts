import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../core/application/repositories/user-repository";
import { UserRepositoryImpl } from "../infra/repositories/user-repository-impl";

export class LoadRepositories {
  private readonly _userRepository: UserRepository;
  public get userRepository(): UserRepository {
    return this._userRepository;
  }

  constructor(args: { prismaClient: PrismaClient }) {
    // Load repositories
    this._userRepository = new UserRepositoryImpl({ prisma: args.prismaClient });
  }
}
