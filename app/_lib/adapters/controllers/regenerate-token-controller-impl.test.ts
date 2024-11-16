import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { Request } from "../../core/domain/models/routes/request";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import { RegenerateTokenControllerImpl } from "./regenerate-token-controller-impl";
import { AuthService } from "../../core/application/gateways/auth-service";
import { UnauthorizedError } from "../../core/domain/errors/unauthorized-error";

describe("regenerate-token-controller-impl.test.ts - get", () => {
  let request: DeepMockProxy<Request>;
  let response: DeepMockProxy<ApiResponse>;
  let authService: MockProxy<AuthService>;

  let sut: RegenerateTokenControllerImpl;

  beforeEach(() => {
    request = mockDeep<Request>();
    response = mockDeep<ApiResponse>();

    authService = mock<AuthService>();

    sut = new RegenerateTokenControllerImpl({ authService });
  });

  test("should return 401 if no token is provided", async () => {
    //! Arrange
    request = mockDeep<Request>({ authorization: { token: undefined } });

    //! Act
    await sut.get(request, response);

    //! Assert
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" });
  });

  test("should return 200 and new token if token is valid", async () => {
    //! Arrange
    const newToken = "newToken";
    request.authorization.token = "validToken";
    authService.regenerateToken.mockResolvedValue(newToken);

    //! Act
    await sut.get(request, response);

    //! Assert
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ token: newToken });
  });

  test("should return 401 if token is invalid", async () => {
    //! Arrange
    request.authorization.token = "invalidToken";
    authService.regenerateToken.mockRejectedValue(new UnauthorizedError());

    //! Act
    await sut.get(request, response);

    //! Assert
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" });
  });

  test("should throw error if an unexpected error occurs", async () => {
    //! Arrange
    request.authorization.token = "validToken";
    const unexpectedError = new Error("Unexpected error");
    authService.regenerateToken.mockRejectedValue(unexpectedError);

    //! Act & Assert
    await expect(sut.get(request, response)).rejects.toThrow(unexpectedError);
  });
});
