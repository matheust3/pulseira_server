import { UserControllerImpl } from "./user-controller";
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
import { Organization } from "@/app/_lib/core/domain/models/organization";
import { Permissions } from "@/app/_lib/core/domain/models/permissions";

describe("UserControllerImpl - post", () => {
  let createUserController: UserControllerImpl;
  let mockUserRepository: MockProxy<UserRepository>;
  let mockUuidService: MockProxy<UuidService>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let user: User;
  let validOrganization: Organization;
  let validPermissions: Permissions;

  beforeEach(() => {
    mockUserRepository = mock<UserRepository>();
    mockUserRepository.findByEmail.mockRejectedValue(new UserNotFoundError());

    mockUuidService = mock<UuidService>();
    mockUuidService.generateV7.mockReturnValue("uuid-v7");

    createUserController = new UserControllerImpl({
      userRepository: mockUserRepository,
      uuidService: mockUuidService,
    });

    validOrganization = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      city: "org city",
      address: "org address",
      cnpj: "00000000000111",
      country: "brazil",
      email: "email@domain.com",
      name: "org name",
      phone: "65999216704",
      state: "mt",
      zip: "78455000",
      isArchived: false,
    };

    validPermissions = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      manageUsers: true,
      manageOrganizations: true,
      manageOrganization: true,
    };

    user = {
      id: "user-id",
      email: "email@domain.com",
      phone: "userPhone",
      password: "test-password",
      name: "Test User",
      organization: validOrganization,
      permissions: validPermissions,
      isArchived: false,
    };

    mockRequest = mock<Request>({
      authorization: {
        user: {
          id: "master-user-id",
          email: "master@email.com",
          name: "Master User",
          permissions: { manageUsers: true },
          phone: user.phone,
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
      permissions: {
        id: "not-valid-permission-uuid-v7",
        manageUsers: false,
        manageOrganizations: false,
        manageOrganization: false,
      },
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

describe("UserControllerImpl - put", () => {
  let updateUserController: UserControllerImpl;
  let mockUserRepository: MockProxy<UserRepository>;
  let mockUuidService: MockProxy<UuidService>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let user: User;
  let validOrganization: Organization;
  let validPermissions: Permissions;

  beforeEach(() => {
    mockUserRepository = mock<UserRepository>();
    mockUuidService = mock<UuidService>();

    updateUserController = new UserControllerImpl({
      userRepository: mockUserRepository,
      uuidService: mockUuidService,
    });

    validOrganization = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      city: "org city",
      address: "org address",
      cnpj: "00000000000111",
      country: "brazil",
      email: "email@domain.com",
      name: "org name",
      phone: "65999216704",
      state: "mt",
      zip: "78455000",
      isArchived: false,
    };

    validPermissions = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      manageUsers: true,
      manageOrganizations: true,
      manageOrganization: true,
    };

    user = {
      id: "user-id",
      email: "email@domain.com",
      phone: "userPhone",
      password: "test-password",
      name: "Test User",
      organization: validOrganization,
      permissions: validPermissions,
      isArchived: false,
    };

    mockRequest = mock<Request>({
      authorization: {
        user: {
          id: "master-user-id",
          email: "master@email.com",
          name: "Master User",
          phone: user.phone,
          permissions: { manageUsers: true },
          organization: user.organization,
        },
      },
    });

    mockResponse = mockDeep<ApiResponse>();
  });

  it("should update a user successfully", async () => {
    mockRequest.json.mockResolvedValue({ user });
    userValidator.validate = jest.fn().mockResolvedValue(user);
    mockUserRepository.update.mockResolvedValue(user);

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(200);
    expect(mockResponse.body).toEqual({ user });
    expect(mockUserRepository.update).toHaveBeenCalledWith(user, mockRequest.authorization.user?.organization.id);
  });

  it("should update a user successfully if not authorized to manage user but is updating won profile", async () => {
    mockRequest = mock<Request>({
      ...mockRequest,
      authorization: { user: { ...mockRequest.authorization.user, permissions: { manageUsers: false }, id: user.id } },
    });
    mockRequest.json.mockResolvedValue({ user });

    userValidator.validate = jest.fn().mockResolvedValue(user);
    mockUserRepository.update.mockResolvedValue(user);

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(200);
    expect(mockResponse.body).toEqual({ user });
    expect(mockUserRepository.update).toHaveBeenCalledWith(user, mockRequest.authorization.user?.organization.id);
  });

  it("should return 401 if user is not authorized", async () => {
    mockRequest.authorization.user = undefined;

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(401);
    expect(mockResponse.body).toEqual({ message: "Unauthorized" });
  });

  it("should return 403 if user does not have manageUsers permission", async () => {
    mockRequest = mock<Request>({
      ...mockRequest,
      authorization: { user: { ...mockRequest.authorization.user, permissions: { manageUsers: false } } },
    });
    mockRequest.json.mockResolvedValue({ user });

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Forbidden" });
  });

  it("should return 403 if user does not have manageUsers permission and user is not updating won user", async () => {
    mockRequest = mock<Request>({
      ...mockRequest,
      authorization: {
        user: { ...mockRequest.authorization.user, permissions: { manageUsers: false }, id: "master-user" },
      },
    });
    user.id = "user-id";
    mockRequest.json.mockResolvedValue({ user });

    userValidator.validate = jest.fn().mockResolvedValue(user);
    mockUserRepository.update.mockResolvedValue(user);

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Forbidden" });
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("should return 400 if JSON is invalid", async () => {
    mockRequest.json.mockRejectedValue(new InvalidJsonError());

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "Invalid JSON" });
  });

  it("should return 400 if validation fails", async () => {
    const validationError = new ValidationError("Validation error", null, "field");
    validationError.errors = ["Validation error"];
    mockRequest.json.mockResolvedValue({ user });
    userValidator.validate = jest.fn().mockRejectedValue(validationError);

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "Validation error" });
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it("should throw for other errors", async () => {
    mockRequest.json.mockRejectedValue(new Error("Unknown error"));

    await expect(updateUserController.put(mockRequest, mockResponse)).rejects.toThrow("Unknown error");
  });

  it("should return 400 if userRepository.update throws UserNotFoundError", async () => {
    mockRequest.json.mockResolvedValue({ user });
    userValidator.validate = jest.fn().mockResolvedValue(user);
    mockUserRepository.update.mockRejectedValue(new UserNotFoundError());

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ message: "User not found" });
  });

  it("should not allow a user to alter their own permissions if they do not have manageUsers permission", async () => {
    mockRequest = mock<Request>({
      ...mockRequest,
      authorization: { user: { ...mockRequest.authorization.user, permissions: { manageUsers: false }, id: user.id } },
    });
    const alteredUser = { ...user, permissions: { manageUsers: true } };
    mockRequest.json.mockResolvedValue({ user: alteredUser });

    userValidator.validate = jest.fn().mockResolvedValue(alteredUser);
    mockUserRepository.update.mockResolvedValue(user);

    await updateUserController.put(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(200);
    expect(mockResponse.body).toEqual({ user });
    expect(mockUserRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        permissions: mockRequest.authorization.user?.permissions,
      }),
      mockRequest.authorization.user?.organization.id,
    );
  });
});

describe("UserControllerImpl - get", () => {
  let getUserController: UserControllerImpl;
  let mockUserRepository: MockProxy<UserRepository>;
  let mockUuidService: MockProxy<UuidService>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let user: User;
  let validOrganization: Organization;
  let validPermissions: Permissions;

  beforeEach(() => {
    mockUserRepository = mock<UserRepository>();
    mockUuidService = mock<UuidService>();

    getUserController = new UserControllerImpl({
      userRepository: mockUserRepository,
      uuidService: mockUuidService,
    });

    validOrganization = {
      id: "6a2f41a3-c54c-fce8-32d2-0324e1c32e22",
      city: "org city",
      address: "org address",
      cnpj: "00000000000111",
      country: "brazil",
      email: "email@domain.com",
      name: "org name",
      phone: "65999216704",
      state: "mt",
      zip: "78455000",
      isArchived: false,
    };

    validPermissions = {
      id: "123e4567-e89b-12d3-a456-426614174001",
      manageUsers: true,
      manageOrganizations: true,
      manageOrganization: true,
    };

    user = {
      id: "user-id",
      email: "email@domain.com",
      phone: "userPhone",
      password: "test-password",
      name: "Test User",
      organization: validOrganization,
      permissions: validPermissions,
      isArchived: false,
    };

    mockRequest = mock<Request>({
      authorization: {
        user: {
          id: "master-user-id",
          email: "master@email.com",
          name: "Master User",
          phone: user.phone,
          permissions: { manageUsers: true },
          organization: user.organization,
        },
      },
    });

    mockResponse = mockDeep<ApiResponse>();
  });

  it("should return users successfully", async () => {
    const users = [user];
    mockUserRepository.getAllInOrganization.mockResolvedValue(users);

    await getUserController.get(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(200);
    expect(mockResponse.body).toEqual({ users });
  });

  it("should return 401 if user is not authorized", async () => {
    mockRequest.authorization.user = undefined;

    await getUserController.get(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(401);
    expect(mockResponse.body).toEqual({ message: "Unauthorized" });
  });

  it("should return 403 if user does not have manageUsers permission", async () => {
    mockRequest = mock<Request>({
      ...mockRequest,
      authorization: { user: { ...mockRequest.authorization.user, permissions: { manageUsers: false } } },
    });

    await getUserController.get(mockRequest, mockResponse);

    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Forbidden" });
  });

  it("should throw if repository throws any error", async () => {
    mockUserRepository.getAllInOrganization.mockRejectedValue(new Error("Repository error"));

    await expect(getUserController.get(mockRequest, mockResponse)).rejects.toThrow("Repository error");
  });
});
