import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { UserRepositoryImpl } from "./user-repository-impl";
import { Organization, Permissions, PrismaClient, User as PrismaUser } from "@prisma/client";
import { UserNotFoundError } from "../../core/domain/errors/user-not-found-error";
import bcrypt from "bcrypt";
import { User } from "../../core/domain/models/user";

jest.mock("bcrypt");

describe("user-repository-impl.test.ts - findByEmail", () => {
  let sut: UserRepository;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    sut = new UserRepositoryImpl({ prisma });
  });

  test("returns user without password hash by default", async () => {
    //! Arrange
    const email = "test@example.com";
    const user = {
      id: "1",
      email,
      name: "Test User",
      organization: { id: "org1", name: "Test Org" },
      permissions: { id: "perm1", manageUsers: true },
    };
    prisma.user.findUnique.mockResolvedValue(mock<PrismaUser>(user));

    //! Act
    const result = await sut.findByEmail(email);

    //! Assert
    expect(result).toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: false,
        organization: { select: { id: true, name: true } },
        permissions: { select: { id: true, manageUsers: true } },
      },
    });
  });

  test("returns user with password hash if option is set", async () => {
    //! Arrange
    const email = "test@example.com";
    const user = {
      id: "1",
      email,
      name: "Test User",
      password: "hashedPassword",
      organization: { id: "org1", name: "Test Org" },
    };
    prisma.user.findUnique.mockResolvedValue(mock<PrismaUser>(user));

    //! Act
    const result = await sut.findByEmail(email, { withPassHash: true });

    //! Assert
    expect(result).toEqual(user);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        organization: { select: { id: true, name: true } },
        permissions: { select: { id: true, manageUsers: true } },
      },
    });
  });

  test("throws UserNotFoundError if user does not exist", async () => {
    //! Arrange
    const email = "nonexistent@example.com";
    prisma.user.findUnique.mockResolvedValue(null);

    //! Act & Assert
    await expect(sut.findByEmail(email)).rejects.toThrow(UserNotFoundError);
  });

  test("throws error if user.permissions is null", async () => {
    //! Arrange
    const email = "test@example.com";
    const user = {
      id: "1",
      email,
      name: "Test User",
      organization: { id: "org1", name: "Test Org" },
      permissions: null,
    };
    prisma.user.findUnique.mockResolvedValue(mock<PrismaUser>(user));

    //! Act & Assert
    await expect(sut.findByEmail(email)).rejects.toThrow("User does not have permissions");
  });
});

describe("user-repository-impl.test.ts - updatePassword", () => {
  let sut: UserRepository;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    sut = new UserRepositoryImpl({ prisma });

    prisma.user.findUnique.mockResolvedValue(mock<PrismaUser>());
  });

  test("ensure call prisma with correct params", async () => {
    //! Arrange
    const email = "test@example.com";
    const password = "newPassword123";
    const hashedPassword = "$2b$10$FKqivT2TYUwXBLiXRXz3Ee19hpYM9zbI.MtpWZHv9yn7DWaAnPmtm";
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

    //! Act
    await sut.updatePassword(email, password);

    //! Assert
    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email },
      data: {
        password: hashedPassword,
        passwordReset: true,
      },
    });
  });

  test("throws UserNotFoundError if user does not exist", async () => {
    //! Arrange
    const email = "nonexistent@example.com";
    const password = "newPassword123";
    prisma.user.findUnique.mockResolvedValue(null);

    //! Act & Assert
    await expect(sut.updatePassword(email, password)).rejects.toThrow(UserNotFoundError);
  });
});

describe("user-repository-impl.test.ts - create", () => {
  let sut: UserRepository;
  let prisma: DeepMockProxy<PrismaClient>;
  let user: MockProxy<User>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    sut = new UserRepositoryImpl({ prisma });

    user = mock<User>({
      id: "1",
      email: "test@example.com",
      name: "Test User",
      password: "plainPassword",
      organization: { id: "org1" },
      permissions: { id: "perm1", manageUsers: true },
    });
  });

  test("creates a user with hashed password", async () => {
    //! Arrange
    const hashedPassword = "$2b$10$FKqivT2TYUwXBLiXRXz3Ee19hpYM9zbI.MtpWZHv9yn7DWaAnPmtm";
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    const createdUser = {
      ...user,
      organization: { id: "org1", name: "Test Org" },
      permissions: { id: "perm1", manageUsers: true },
    } as PrismaUser & { organization: Organization; permissions: Permissions };
    prisma.user.create.mockResolvedValue(createdUser);

    //! Act
    const result = await sut.create(user);

    //! Assert
    expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 10);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        password: hashedPassword,
        organization: { connect: { id: user.organization.id } },
        permissions: { create: { manageUsers: user.permissions.manageUsers, id: user.permissions.id } },
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: false,
        organization: { select: { id: true, name: true } },
        permissions: { select: { id: true, manageUsers: true } },
      },
    });
    expect(result).toEqual(
      expect.objectContaining({
        id: user.id,
        email: user.email,
        name: user.name,
        organization: { id: "org1", name: "Test Org" },
        permissions: { id: "perm1", manageUsers: true },
      }),
    );
    expect(result.password).toBeUndefined();
  });

  test("throws error if user.permissions is null", async () => {
    //! Arrange
    const hashedPassword = "$2b$10$FKqivT2TYUwXBLiXRXz3Ee19hpYM9zbI.MtpWZHv9yn7DWaAnPmtm";
    (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
    const createdUser = {
      ...user,
      organization: { id: "org1", name: "Test Org" },
      permissions: null,
    } as PrismaUser & { organization: Organization; permissions: null };
    prisma.user.create.mockResolvedValue(createdUser);

    //! Act & Assert
    await expect(sut.create(user)).rejects.toThrow("User does not have permissions");
  });

  test("throws error if password is undefined", async () => {
    //! Arrange
    user.password = undefined;

    //! Act & Assert
    await expect(sut.create(user)).rejects.toThrow("Password is required to hash it");
  });
});
