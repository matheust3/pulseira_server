import { ApiResponse } from "../../../domain/models/routes/api-response";
import { Request } from "../../../domain/models/routes/request";
import { ApiController } from "../api-controller";

export interface OrganizationController extends ApiController {
  get: (req: Request, res: ApiResponse) => Promise<void>;
  post: (req: Request, res: ApiResponse) => Promise<void>;
  put: (req: Request, res: ApiResponse) => Promise<void>;
}
