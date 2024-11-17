import { DeepMockProxy, mock, mockDeep } from "jest-mock-extended";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { UserRepositoryImpl } from "./user-repository-impl";
import { PrismaClient, User } from "@prisma/client";
import { UserNotFoundError } from "../../core/domain/errors/user-not-found-error";
import bcrypt from "bcrypt";

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
    prisma.user.findUnique.mockResolvedValue(mock<User>(user));

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
    prisma.user.findUnique.mockResolvedValue(mock<User>(user));

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
    prisma.user.findUnique.mockResolvedValue(mock<User>(user));

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

    prisma.user.findUnique.mockResolvedValue(mock<User>());
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
