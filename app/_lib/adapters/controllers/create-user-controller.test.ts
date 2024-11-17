import { CreateUserControllerImpl } from "./create-user-controller";
import { UuidService } from "../../core/application/gateways/uuid-service";
import { UserRepository } from "../../core/application/repositories/user-repository";
import { InvalidJsonError } from "../../core/domain/errors/invalid-json-error";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import { User } from "../../core/domain/models/user";
import { userValidator } from "../../utils/validators/user-validator";
import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { Request } from "../../core/domain/models/routes/request";

describe("CreateUserControllerImpl", () => {
  let createUserController: CreateUserControllerImpl;
  let mockUserRepository: MockProxy<UserRepository>;
  let mockUuidService: MockProxy<UuidService>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let user: User;

  beforeEach(() => {
    mockUserRepository = mock<UserRepository>();

    mockUuidService = mock<UuidService>();
    mockUuidService.generateV7.mockReturnValue("uuid-v7");

    createUserController = new CreateUserControllerImpl({
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
});
