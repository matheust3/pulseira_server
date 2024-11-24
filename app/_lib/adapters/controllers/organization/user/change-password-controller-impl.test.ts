import { ChangePasswordControllerImpl } from "./change-password-controller-impl";
import { AuthService } from "@/app/_lib/core/application/gateways/auth-service";
import { UserRepository } from "@/app/_lib/core/application/repositories/user-repository";
import { InvalidJsonError } from "@/app/_lib/core/domain/errors/invalid-json-error";
import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Request } from "@/app/_lib/core/domain/models/routes/request";
import { passwordValidator } from "@/app/_lib/utils/validators/password-validator";
import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { ValidationError } from "yup";

describe("ChangePasswordControllerImpl - post", () => {
  let changePasswordController: ChangePasswordControllerImpl;
  let mockUserRepository: MockProxy<UserRepository>;
  let mockAuthService: MockProxy<AuthService>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;

  beforeEach(() => {
    mockUserRepository = mock<UserRepository>();
    mockAuthService = mock<AuthService>();

    changePasswordController = new ChangePasswordControllerImpl({
      userRepository: mockUserRepository,
      authService: mockAuthService,
    });

    mockRequest = mock<Request>({
      authorization: {
        user: {
          id: "user-id",
          email: "email@domain.com",
        },
      },
    });

    mockResponse = mockDeep<ApiResponse>();
  });

  it("should change password successfully", async () => {
    const body = { oldPassword: "old-pass", newPassword: "new-pass" };
    mockRequest.json.mockResolvedValue(body);
    passwordValidator.validate = jest.fn().mockResolvedValue(body.newPassword);
    mockAuthService.login.mockResolvedValue("token");
    mockUserRepository.updatePassword.mockResolvedValue();

    await changePasswordController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(200);
    expect(mockResponse.body).toEqual({ message: "Password updated successfully" });
    expect(mockUserRepository.changePassword).toHaveBeenCalledWith("user-id", body.newPassword);
  });

  it("should return 401 if user is not authorized", async () => {
    mockRequest.authorization.user = undefined;

    await changePasswordController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(401);
    expect(mockResponse.body).toEqual({ message: "Unauthorized" });
  });

  it("should return 400 if old password is invalid", async () => {
    const body = { oldPassword: "old-pass", newPassword: "new-pass" };
    mockRequest.json.mockResolvedValue(body);
    passwordValidator.validate = jest.fn().mockResolvedValue(body.newPassword);
    mockAuthService.login.mockRejectedValue(new Error("Invalid old password"));

    await changePasswordController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Invalid old password" });
  });

  it("should return 400 if JSON is invalid", async () => {
    mockRequest.json.mockRejectedValue(new InvalidJsonError());

    await changePasswordController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "Invalid JSON" });
  });

  it("should return 400 if validation fails", async () => {
    const body = { oldPassword: "old-pass", newPassword: "new-pass" };
    const validationError = new ValidationError("Validation error", null, "field");
    validationError.errors = ["Validation error"];
    mockRequest.json.mockResolvedValue(body);
    passwordValidator.validate = jest.fn().mockRejectedValue(validationError);

    await changePasswordController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "Validation error" });
  });

  it("should return 500 for other errors", async () => {
    const body = { oldPassword: "old-pass", newPassword: "new-pass" };
    mockRequest.json.mockResolvedValue(body);
    passwordValidator.validate = jest.fn().mockResolvedValue(body.newPassword);
    mockAuthService.login.mockResolvedValue("token");
    mockUserRepository.changePassword.mockRejectedValue(new Error("Unknown error"));

    await changePasswordController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(500);
    expect(mockResponse.body).toEqual({ message: "Internal server error" });
  });
});
