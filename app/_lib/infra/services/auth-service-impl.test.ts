import { AuthServiceImpl } from "./auth-service-impl";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { JwtService } from "../../core/application/gateways/jwt-service";
import { mock, MockProxy } from "jest-mock-extended";
import { User } from "../../core/domain/models/user";
import bcrypt from "bcrypt";
import { UnauthorizedError } from "../../core/domain/errors/unauthorized-error";
import { AuthToken } from "../../core/domain/models/authentication/AuthToken";

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

describe("auth-service-impl.test.ts - regenerateToken", () => {
  let sut: AuthServiceImpl;
  let jwtService: MockProxy<JwtService>;

  beforeEach(() => {
    jwtService = mock<JwtService>();
    sut = new AuthServiceImpl({ userRepository: mock<UserRepository>(), jwtService });
  });

  test("should return a new token if regeneration is successful", async () => {
    //! Arrange
    jwtService.generateRefreshToken.mockResolvedValue("new_token");
    //! Act
    const token = await sut.regenerateToken("old_token");
    //! Assert
    expect(token).toBe("new_token");
    expect(jwtService.generateRefreshToken).toHaveBeenCalledWith("old_token", "4h");
  });

  test("should throw UnauthorizedError if token regeneration fails", async () => {
    //! Arrange
    jwtService.generateRefreshToken.mockRejectedValue(new Error("Token error"));
    //! Act & Assert
    await expect(sut.regenerateToken("old_token")).rejects.toThrow(UnauthorizedError);
  });
});

describe("auth-service-impl.test.ts - verifyToken", () => {
  let sut: AuthServiceImpl;
  let jwtService: MockProxy<JwtService>;

  beforeEach(() => {
    jwtService = mock<JwtService>();
    sut = new AuthServiceImpl({ userRepository: mock<UserRepository>(), jwtService });
  });

  test("should return AuthToken if token is valid", async () => {
    //! Arrange
    const authToken = mock<AuthToken<User>>({ data: mock<User>({ id: "user_id" }) });

    jwtService.validateToken.mockResolvedValue(authToken);
    //! Act
    const result = await sut.verifyToken("valid_token");
    //! Assert
    expect(result).toBe(authToken);
    expect(jwtService.validateToken).toHaveBeenCalledWith("valid_token");
  });

  test("should throw UnauthorizedError if token is invalid", async () => {
    //! Arrange
    jwtService.validateToken.mockRejectedValue(new Error("Invalid token"));
    //! Act & Assert
    await expect(sut.verifyToken("invalid_token")).rejects.toThrow(UnauthorizedError);
  });
});
