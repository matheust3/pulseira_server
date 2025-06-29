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

  async changePassword(id: string, password: string): Promise<void> {
    const hashedPassword = await this.hashPassword(password);
    await this.prisma.user.update({ where: { id }, data: { password: hashedPassword, passwordReset: false } });
  }

  async findById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        isArchived: true,
        password: false,
        organization: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            cnpj: true,
            country: true,
            email: true,
            phone: true,
            state: true,
            zip: true,
            isArchived: true,
          },
        },
        permissions: { select: { id: true, manageUsers: true, manageOrganization: true, manageOrganizations: true } },
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

  async getAllInOrganization(organizationId: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        isArchived: true,
        phone: true,
        organization: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            cnpj: true,
            country: true,
            email: true,
            phone: true,
            state: true,
            zip: true,
            isArchived: true,
          },
        },
        permissions: { select: { id: true, manageUsers: true, manageOrganization: true, manageOrganizations: true } },
      },
    });
    return users.map((user) => {
      if (user.permissions === null) {
        throw new Error("User does not have permissions");
      } else {
        return { ...user, permissions: user.permissions };
      }
    });
  }

  async update(user: User, organizationId: string): Promise<User> {
    const exists = await this.prisma.user.findUnique({ where: { id: user.id, organizationId } });
    if (!exists) {
      throw new UserNotFoundError();
    } else {
      const updatedUser = await this.prisma.user.update({
        data: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          isArchived: user.isArchived,
          permissions: { update: { manageUsers: user.permissions.manageUsers } },
        },
        where: { id: user.id, organizationId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isArchived: true,
          organization: {
            select: {
              id: true,
              name: true,
              address: true,
              city: true,
              cnpj: true,
              country: true,
              email: true,
              phone: true,
              state: true,
              zip: true,
              isArchived: true,
            },
          },
          permissions: { select: { id: true, manageUsers: true, manageOrganization: true, manageOrganizations: true } },
        },
      });

      if (updatedUser.permissions === null) {
        throw new Error("User does not have permissions");
      } else {
        return { ...updatedUser, permissions: updatedUser.permissions };
      }
    }
  }

  private async hashPassword(password?: string): Promise<string> {
    if (!password) {
      throw new Error("Password is required to hash it");
    }
    return bcrypt.hash(password, 10);
  }

  async create(user: User): Promise<User> {
    const hashedPassword = await this.hashPassword(user.password);

    const createdUser = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        password: hashedPassword,
        organization: { connect: { id: user.organization.id } },
        permissions: { create: { manageUsers: user.permissions.manageUsers, id: user.permissions.id } },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        password: false,
        isArchived: true,
        organization: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            cnpj: true,
            country: true,
            email: true,
            phone: true,
            state: true,
            zip: true,
            isArchived: true,
          },
        },
        permissions: { select: { id: true, manageUsers: true, manageOrganization: true, manageOrganizations: true } },
      },
    });

    if (createdUser.permissions === null) {
      throw new Error("User does not have permissions");
    } else {
      const user: User = { ...createdUser, permissions: createdUser.permissions };
      delete user.password;
      return user;
    }
  }

  async findByEmail(email: string, options?: { withPassHash: boolean }): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        isArchived: true,
        password: options?.withPassHash === true || false,
        organization: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            cnpj: true,
            country: true,
            email: true,
            phone: true,
            state: true,
            zip: true,
            isArchived: true,
          },
        },
        permissions: { select: { id: true, manageUsers: true, manageOrganization: true, manageOrganizations: true } },
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
