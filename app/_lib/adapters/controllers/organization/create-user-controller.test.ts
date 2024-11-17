import { UserControllerImpl } from "./create-user-controller";
import { UuidService } from "../../../core/application/gateways/uuid-service";
import { UserRepository } from "../../../core/application/repositories/user-repository";
import { InvalidJsonError } from "../../../core/domain/errors/invalid-json-error";
import { ApiResponse } from "../../../core/domain/models/routes/api-response";
import { User } from "../../../core/domain/models/user";
import { userValidator } from "../../../utils/validators/user-validator";
import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { Request } from "../../../core/domain/models/routes/request";
import { ValidationError } from "yup";
import { UserNotFoundError } from "../../../core/domain/errors/user-not-found-error";

describe("CreateUserControllerImpl - post", () => {
  let createUserController: UserControllerImpl;
  let mockUserRepository: MockProxy<UserRepository>;
  let mockUuidService: MockProxy<UuidService>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let user: User;

  beforeEach(() => {
    mockUserRepository = mock<UserRepository>();
    mockUserRepository.findByEmail.mockRejectedValue(new UserNotFoundError());

    mockUuidService = mock<UuidService>();
    mockUuidService.generateV7.mockReturnValue("uuid-v7");

    createUserController = new UserControllerImpl({
      userRepository: mockUserRepository,
      uuidService: mockUuidService,
    });

    user = {
      id: "user-id",
      email: "email@domain.com",
      password: "test-password",
      name: "Test User",
      organization: { id: "org-id", name: "org-name" },
      permissions: { id: "perm-id", manageUsers: false },
    };

    mockRequest = mock<Request>({
      authorization: {
        user: {
          id: "master-user-id",
          email: "master@email.com",
          name: "Master User",
          permissions: { manageUsers: true },
          organization: user.organization,
        },
      },
    });

    mockResponse = mockDeep<ApiResponse>();
  });

  it("should create a user successfully", async () => {
    mockRequest.json.mockResolvedValue({ user });
    userValidator.validate = jest.fn().mockResolvedValue(user);
    mockUserRepository.create.mockResolvedValue(user);

    await createUserController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(201);
    expect(mockResponse.body).toEqual({ user });
  });

  it("should return 401 if user is not authorized", async () => {
    mockRequest.authorization.user = undefined;

    await createUserController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(401);
    expect(mockResponse.body).toEqual({ message: "Unauthorized" });
  });

  it("should return 403 if user does not have manageUsers permission", async () => {
    mockRequest = mock<Request>({
      ...mockRequest,
      authorization: { user: { ...mockRequest.authorization.user, permissions: { manageUsers: false } } },
    });

    await createUserController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Forbidden" });
  });

  it("should return 400 if JSON is invalid", async () => {
    mockRequest.json.mockRejectedValue(new InvalidJsonError());

    await createUserController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "Invalid JSON" });
  });

  it("should return 400 if validation fails", async () => {
    const validationError = new ValidationError("Validation error", null, "field");
    validationError.errors = ["Validation error"];
    mockRequest.json.mockResolvedValue({ user });
    userValidator.validate = jest.fn().mockRejectedValue(validationError);

    await createUserController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "Validation error" });
  });

  it("should throws for other errors", async () => {
    mockRequest.json.mockRejectedValue(new Error("Unknown error"));

    await expect(createUserController.post(mockRequest, mockResponse)).rejects.toThrow("Unknown error");
  });

  it("should assign user details correctly", async () => {
    mockRequest.json.mockResolvedValue(user);
    userValidator.validate = jest.fn().mockResolvedValue(user);
    mockUserRepository.create.mockResolvedValue(user);

    await createUserController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(201);
    expect(mockResponse.body).toEqual({ user });
  });

  it("should call userRepository.create with correct values", async () => {
    mockRequest.json.mockResolvedValue({ user });
    mockUserRepository.create.mockResolvedValue(user);
    mockUuidService.generateV7
      .mockReturnValueOnce("not-valid-user-uuid-v7")
      .mockReturnValueOnce("password-uuid-v7")
      .mockReturnValueOnce("not-valid-permission-uuid-v7");
    userValidator.validate = jest.fn().mockResolvedValue({
      ...user,
      id: "user-uuid-v7",
      permissions: { id: "permission-uuid-v7", manageUsers: false },
      organizationValidator: { id: "organization-uuid-v7" },
    });

    await createUserController.post(mockRequest, mockResponse);

    expect(userValidator.validate).toHaveBeenCalledWith({
      ...user,
      id: "not-valid-user-uuid-v7",
      permissions: { id: "not-valid-permission-uuid-v7", manageUsers: false },
    });

    expect(mockUserRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user-uuid-v7",
        email: user.email,
        password: "password-uuid-v7", // Assuming password is set to a generated UUID
        name: user.name,
        organization: user.organization,
        permissions: expect.objectContaining({
          id: "permission-uuid-v7",
          manageUsers: false,
        }),
      }),
    );
  });

  it("should return 400 if user already exists", async () => {
    mockRequest.json.mockResolvedValue({ user });
    userValidator.validate = jest.fn().mockResolvedValue(user);
    mockUserRepository.findByEmail.mockResolvedValue(user);

    await createUserController.post(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "User already exists" });
  });
});

describe("CreateUserControllerImpl - delete", () => {
  let createUserController: UserControllerImpl;
  let mockUserRepository: MockProxy<UserRepository>;
  let mockUuidService: MockProxy<UuidService>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let user: User;

  beforeEach(() => {
    mockUserRepository = mock<UserRepository>();
    mockUserRepository.findByEmail.mockRejectedValue(new UserNotFoundError());

    mockUuidService = mock<UuidService>();
    mockUuidService.generateV7.mockReturnValue("uuid-v7");

    createUserController = new UserControllerImpl({
      userRepository: mockUserRepository,
      uuidService: mockUuidService,
    });

    user = {
      id: "user-id",
      email: "email@domain.com",
      password: "test-password",
      name: "Test User",
      organization: { id: "org-id", name: "org-name" },
      permissions: { id: "perm-id", manageUsers: false },
    };

    mockRequest = mock<Request>({
      authorization: {
        user: {
          id: "master-user-id",
          email: "master@email.com",
          name: "Master User",
          permissions: { manageUsers: true },
          organization: user.organization,
        },
      },
    });

    mockResponse = mockDeep<ApiResponse>();
  });

  it("should delete a user successfully", async () => {
    mockRequest.searchParams = new URLSearchParams({ userId: "user-id" });
    mockUserRepository.delete.mockResolvedValue();

    await createUserController.delete(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(204);
    expect(mockResponse.body).toBeNull();
  });

  it("should return 401 if user is not authorized", async () => {
    mockRequest.authorization.user = undefined;

    await createUserController.delete(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(401);
    expect(mockResponse.body).toEqual({ message: "Unauthorized" });
  });

  it("should return 403 if user does not have manageUsers permission", async () => {
    mockRequest = mock<Request>({
      ...mockRequest,
      authorization: { user: { ...mockRequest.authorization.user, permissions: { manageUsers: false } } },
    });

    await createUserController.delete(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Forbidden" });
  });

  it("should return 400 if userId is missing", async () => {
    mockRequest.searchParams = new URLSearchParams();

    await createUserController.delete(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "Missing userId" });
  });

  it("should return 404 if user is not found", async () => {
    mockRequest.searchParams = new URLSearchParams({ userId: "user-id" });
    mockUserRepository.delete.mockRejectedValue(new UserNotFoundError());

    await createUserController.delete(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(404);
    expect(mockResponse.body).toEqual({ message: "User not found" });
  });

  it("should throw for other errors", async () => {
    mockRequest.searchParams = new URLSearchParams({ userId: "user-id" });
    mockUserRepository.delete.mockRejectedValue(new Error("Unknown error"));

    await expect(createUserController.delete(mockRequest, mockResponse)).rejects.toThrow("Unknown error");
  });
});
