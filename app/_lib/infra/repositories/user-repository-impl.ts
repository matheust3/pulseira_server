import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { UserNotFoundError } from "../../core/domain/errors/user-not-found-error";

export class UserRepositoryImpl implements UserRepository {
  private readonly prisma: PrismaClient;

  constructor(args: { prisma: PrismaClient }) {
    this.prisma = args.prisma;
  }

  async updatePassword(email: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UserNotFoundError();
    }
    await this.prisma.user.update({
      where: { email },
      data: { password },
    });
  }
}
