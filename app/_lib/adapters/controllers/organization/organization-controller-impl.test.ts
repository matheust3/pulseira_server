import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { OrganizationControllerImpl } from "./organization-controller-impl";
import { OrganizationRepository } from "@/app/_lib/core/application/repositories/organization-repository";
import { User } from "@/app/_lib/core/domain/models/user";
import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Request } from "@/app/_lib/core/domain/models/routes/request";
import { Organization } from "@/app/_lib/core/domain/models/organization";
import { OrganizationNotFoundError } from "@/app/_lib/core/domain/errors/organization-not-found-error";
import { InvalidJsonError } from "@/app/_lib/core/domain/errors/invalid-json-error";
import { ValidationError } from "yup";
import { organizationValidator } from "@/app/_lib/utils/validators/organization-validator";

describe("organization-controller-impl.test.ts - get", () => {
  let organizationRepository: MockProxy<OrganizationRepository>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let sut: OrganizationControllerImpl;

  beforeEach(() => {
    organizationRepository = mock<OrganizationRepository>();
    sut = new OrganizationControllerImpl({ organizationRepository });

    mockRequest = mockDeep<Request>({
      authorization: {
        user: mock<User>({
          id: "master-user-id",
          email: "master@email.com",
          name: "Master User",
        }),
      },
    });

    mockResponse = mockDeep<ApiResponse>();
  });

  test("ensure return 401 if user is undefined", async () => {
    //! Arrange
    mockRequest.authorization.user = undefined;
    //! Act
    await sut.get(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(401);
    expect(mockResponse.body).toEqual({ message: "Unauthorized" });
  });

  test("ensure return 200 and organizations if user has manageOrganizations permission", async () => {
    //! Arrange
    mockRequest = mockDeep<Request>({
      ...mockRequest,
      authorization: { user: { permissions: { manageOrganizations: true } } },
    });
    const organizations = mock<Organization[]>([{ id: "org1", name: "Organization 1" }]);
    organizationRepository.getAll.mockResolvedValue(organizations);
    //! Act
    await sut.get(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(200);
    expect(mockResponse.body).toEqual(organizations);
  });

  test("ensure return 403 if user does not have manageOrganizations permission", async () => {
    //! Arrange
    mockRequest = mockDeep<Request>({
      ...mockRequest,
      authorization: { user: { permissions: { manageOrganizations: false } } },
    });
    //! Act
    await sut.get(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Forbidden" });
  });
});

describe("organization-controller-impl.test.ts - post", () => {
  let organizationRepository: MockProxy<OrganizationRepository>;
  let mockRequest: MockProxy<Request>;
  let mockResponse: DeepMockProxy<ApiResponse>;
  let sut: OrganizationControllerImpl;

  beforeEach(() => {
    organizationRepository = mock<OrganizationRepository>();
    sut = new OrganizationControllerImpl({ organizationRepository });

    organizationRepository.getByCnpj.mockRejectedValue(new OrganizationNotFoundError());

    mockRequest = mockDeep<Request>({
      authorization: {
        user: mock<User>({
          id: "master-user-id",
          email: "master@email.com",
          name: "Master User",
        }),
      },
    });

    mockResponse = mockDeep<ApiResponse>();

    organizationValidator.validate = jest.fn().mockResolvedValue({ cnpj: "valid-cnpj", name: "Valid Organization" });
  });

  test("ensure return 401 if user is undefined", async () => {
    //! Arrange
    mockRequest.authorization.user = undefined;
    //! Act
    await sut.post(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(401);
    expect(mockResponse.body).toEqual({ message: "Unauthorized" });
  });

  test("ensure return 201 and organization if user has manageOrganizations permission and valid organization", async () => {
    //! Arrange
    mockRequest = mockDeep<Request>({
      ...mockRequest,
      authorization: { user: { permissions: { manageOrganizations: true } } },
      json: jest.fn().mockResolvedValue({ organization: { cnpj: "valid-cnpj", name: "Valid Organization" } }),
    });
    const validOrganization = { cnpj: "valid-cnpj", name: "Valid Organization" };
    organizationRepository.getByCnpj.mockRejectedValue(new Error("Not found"));
    organizationRepository.create.mockResolvedValue(mock<Organization>(validOrganization));
    //! Act
    await sut.post(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(201);
    expect(mockResponse.body).toEqual({ organization: validOrganization });
  });

  test("ensure return 409 if organization already exists", async () => {
    //! Arrange
    mockRequest = mockDeep<Request>({
      ...mockRequest,
      authorization: { user: { permissions: { manageOrganizations: true } } },
      json: jest.fn().mockResolvedValue({ organization: { cnpj: "existing-cnpj", name: "Existing Organization" } }),
    });
    const existingOrganization = { cnpj: "existing-cnpj", name: "Existing Organization" };
    organizationRepository.getByCnpj.mockResolvedValue(mock<Organization>(existingOrganization));
    //! Act
    await sut.post(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(409);
    expect(mockResponse.body).toEqual({ error: "Organization with this CNPJ already exists" });
  });

  test("ensure return 400 if invalid JSON", async () => {
    //! Arrange
    mockRequest = mockDeep<Request>({
      ...mockRequest,
      authorization: { user: { permissions: { manageOrganizations: true } } },
      json: jest.fn().mockRejectedValue(new InvalidJsonError()),
    });
    //! Act
    await sut.post(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ error: "Invalid JSON" });
  });

  test("ensure return 400 if validation error", async () => {
    //! Arrange
    mockRequest = mockDeep<Request>({
      ...mockRequest,
      authorization: { user: { permissions: { manageOrganizations: true } } },
      json: jest.fn().mockResolvedValue({ organization: { cnpj: "invalid-cnpj", name: "Invalid Organization" } }),
    });
    const validationError = new ValidationError("Validation error");
    organizationValidator.validate = jest.fn().mockRejectedValue(validationError);
    //! Act
    await sut.post(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(400);
    expect(mockResponse.body).toEqual({ error: validationError.message });
  });

  test("ensure return 403 if user does not have manageOrganizations permission", async () => {
    //! Arrange
    mockRequest = mockDeep<Request>({
      ...mockRequest,
      authorization: { user: { permissions: { manageOrganizations: false } } },
    });
    //! Act
    await sut.post(mockRequest, mockResponse);
    //! Assert
    expect(mockResponse.status).toBe(403);
    expect(mockResponse.body).toEqual({ message: "Forbidden" });
  });
});
