import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { OrganizationControllerImpl } from "./organization-controller-impl";
import { OrganizationRepository } from "@/app/_lib/core/application/repositories/organization-repository";
import { User } from "@/app/_lib/core/domain/models/user";
import { ApiResponse } from "@/app/_lib/core/domain/models/routes/api-response";
import { Request } from "@/app/_lib/core/domain/models/routes/request";
import { Organization } from "@/app/_lib/core/domain/models/organization";

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
