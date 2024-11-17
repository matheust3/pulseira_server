import { PrismaClient } from "@prisma/client";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { UserNotFoundError } from "../../core/domain/errors/user-not-found-error";
import bcrypt from "bcrypt";
import { User } from "../../core/domain/models/user";

export class UserRepositoryImpl implements UserRepository {
  private readonly prisma: PrismaClient;

  constructor(args: { prisma: PrismaClient }) {
    this.prisma = args.prisma;
  }

  async findByEmail(email: string, options?: { withPassHash: boolean }): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: options?.withPassHash === true || false,
        organization: { select: { id: true, name: true } },
        permissions: { select: { id: true, manageUsers: true } },
      },
    });

    if (!user) {
      throw new UserNotFoundError();
    } else {
      if (user.permissions === null) {
        throw new Error("User does not have permissions");
      } else {
        return { ...user, permissions: user.permissions };
      }
    }
  }

  async updatePassword(email: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UserNotFoundError();
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        passwordReset: true,
      },
    });
  }
}
