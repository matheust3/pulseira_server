import { LoginControllerImpl } from "./login-controller-impl";
import { AuthService } from "../../core/application/gateways/auth-service";
import { Request } from "../../core/domain/models/routes/request";
import { ApiResponse } from "../../core/domain/models/routes/api-response";
import { DeepMockProxy, mock, mockDeep, MockProxy } from "jest-mock-extended";
import { ForbiddenError } from "../../core/domain/errors/forbidden-error";

describe("LoginControllerImpl", () => {
  let authService: MockProxy<AuthService>;
  let loginController: LoginControllerImpl;
  let req: DeepMockProxy<Request>;
  let res: MockProxy<ApiResponse>;

  beforeEach(() => {
    authService = mock<AuthService>();
    loginController = new LoginControllerImpl({ authService });

    authService.login.mockResolvedValue("token");

    req = mockDeep<Request>();
    res = mockDeep<ApiResponse>();
  });

  it("should return 200 and token on successful login", async () => {
    req.json.mockResolvedValue({ email: "test@example.com", password: "password" });

    authService.login.mockResolvedValue("token");

    await loginController.post(req, res);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token: "token" });
  });

  it("should return 401 on invalid login", async () => {
    req.json.mockResolvedValue({ email: "test@example.com", password: "wrongPassword" });
    authService.login.mockRejectedValue(new Error("Invalid email or password"));

    await loginController.post(req, res);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
  });

  it("should return 401 on invalid email format", async () => {
    req.json.mockResolvedValue({ email: "invalid-email", password: "password" });

    await loginController.post(req, res);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid email or password" });
  });

  it("should return 403 on forbidden error", async () => {
    req.json.mockResolvedValue({ email: "test@example.com", password: "password" });
    authService.login.mockRejectedValue(new ForbiddenError());

    await loginController.post(req, res);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "User can not access this resource" });
  });
});
