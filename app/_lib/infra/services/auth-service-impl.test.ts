import { AuthServiceImpl } from "./auth-service-impl";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { JwtService } from "../../core/application/gateways/jwt-service";
import { mock, MockProxy } from "jest-mock-extended";
import { User } from "../../core/domain/models/user";
import bcrypt from "bcrypt";

jest.mock("bcrypt");

describe("auth-service-impl.test.ts - login", () => {
  let sut: AuthServiceImpl;
  let userRepository: MockProxy<UserRepository>;
  let jwtService: MockProxy<JwtService>;
  let user: MockProxy<User>;

  beforeEach(() => {
    userRepository = mock<UserRepository>();
    jwtService = mock<JwtService>();
    sut = new AuthServiceImpl({ userRepository, jwtService });

    user = mock<User>({ password: "password", name: "matheus" });

    userRepository.findByEmail.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  test("ensure call repository with correct params", async () => {
    //! Arrange
    //! Act
    await sut.login("email", "password");
    //! Assert
    expect(userRepository.findByEmail).toHaveBeenCalledWith("email", { withPassHash: true });
  });

  test("should throw error if password is invalid", async () => {
    //! Arrange
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    //! Act & Assert
    await expect(sut.login("email", "invalid_password")).rejects.toThrow("Invalid password");
  });

  test("should throw error if user's password is undefined", async () => {
    //! Arrange
    userRepository.findByEmail.mockResolvedValue(mock<User>({ password: undefined }));
    //! Act & Assert
    await expect(sut.login("email", "password")).rejects.toThrow("Invalid password");
  });

  test("should return token if login is successful", async () => {
    //! Arrange
    jwtService.generateToken.mockResolvedValue("valid_token");
    const validUser = {
      name: "matheus",
      email: "email",
      password: "password",
    } as unknown as User;
    const userWithPassword = { ...validUser };
    delete userWithPassword.password;
    userRepository.findByEmail.mockResolvedValue(validUser);
    //! Act
    const token = await sut.login("email", "password");
    //! Assert
    expect(token).toBe("valid_token");
    expect(jwtService.generateToken).toHaveBeenCalledWith(userWithPassword, "4h");
  });
});
