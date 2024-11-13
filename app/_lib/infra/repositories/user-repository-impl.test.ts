import { DeepMockProxy, mock, mockDeep } from "jest-mock-extended";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { UserRepositoryImpl } from "./user-repository-impl";
import { PrismaClient, User } from "@prisma/client";
import { UserNotFoundError } from "../../core/domain/errors/user-not-found-error";
import bcrypt from "bcrypt";

jest.mock("bcrypt");

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
