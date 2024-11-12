import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { RecoverPasswordController } from "../../core/application/controllers/recover-password-controller";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { RecoverPasswordControllerImpl } from "./recover-password-controller-impl";
import { Request } from "../../core/domain/models/routes/request";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import * as passwordGenerator from "../../utils/password-generator";
import { InvalidJsonError } from "../../core/domain/errors/invalid-json-error";
import { UserNotFoundError } from "../../core/domain/errors/user-not-found-error";
import { ResendEmailProvider } from "../../infra/gateways/resend-email-provider";

describe("recover-password-controller-impl.test.ts - post", () => {
  let sut: RecoverPasswordController;
  let userRepository: MockProxy<UserRepository>;
  let request: DeepMockProxy<Request>;
  let response: MockProxy<ApiResponse>;
  let emailProvider: MockProxy<ResendEmailProvider>;
  let generatePasswordMock: MockProxy<typeof passwordGenerator.generatePassword>;

  beforeEach(() => {
    userRepository = mock<UserRepository>();
    emailProvider = mock<ResendEmailProvider>();
    sut = new RecoverPasswordControllerImpl({ userRepository, emailProvider });

    request = mockDeep<Request>();
    request.json.mockResolvedValue({ email: "email@doman.com" });
    response = mock<ApiResponse>();

    // Spy on generatePassword function
    generatePasswordMock = jest
      .spyOn(passwordGenerator, "generatePassword")
      .mockReturnValue("mockedPassword") as unknown as MockProxy<typeof passwordGenerator.generatePassword>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("ensure use password generator", async () => {
    //! Arrange
    //! Act
    await sut.post(request, response);
    //! Assert
    expect(generatePasswordMock).toHaveBeenCalled();
  });

  test("should return 400 if req.json() throws an error", async () => {
    //! Arrange
    request.json.mockImplementation(() => {
      throw new InvalidJsonError();
    });

    //! Act
    await sut.post(request, response);

    //! Assert
    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid JSON" });
  });

  test("should return 400 if requestBody.email is invalid", async () => {
    //! Arrange
    request.json.mockResolvedValue({ email: "invalid-email" });

    //! Act
    await sut.post(request, response);

    //! Assert
    expect(response.status).toBe(400);
  });

  test("should update user password", async () => {
    //! Arrange
    const email = "email@domain.com";
    const password = "mockedPassword";
    request.json.mockResolvedValue({ email });

    //! Act
    await sut.post(request, response);

    //! Assert
    expect(userRepository.updatePassword).toHaveBeenCalledWith(email, password);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Password updated successfully" });
  });

  test("should return 200 if user repository throws UserNotFoundError", async () => {
    //! Arrange
    userRepository.updatePassword.mockRejectedValue(new UserNotFoundError());

    //! Act
    await sut.post(request, response);

    //! Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "Password updated successfully" });
  });

  test("should throw if user repository throws any other error", async () => {
    //! Arrange
    const genericError = new Error("Generic error");
    userRepository.updatePassword.mockRejectedValue(genericError);

    //! Act & Assert
    await expect(sut.post(request, response)).rejects.toThrow(genericError);
  });

  test("should send new provisional password to user", async () => {
    //! Arrange
    const email = "email@domain.com";
    const password = "mockedPassword";
    request.json.mockResolvedValue({ email });

    //! Act
    await sut.post(request, response);

    //! Assert
    expect(emailProvider.sendEmail).toHaveBeenCalledWith(
      email,
      "Recuperação de senha",
      `Sua nova senha provisoria é: ${password}`,
      `<p>Sua nova senha provisoria é: <strong>${password}</strong></p>`,
    );
  });
});
