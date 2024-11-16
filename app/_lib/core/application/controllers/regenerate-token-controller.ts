import { ApiResponse } from "../../domain/models/routes/api-response";
import { Request } from "../../domain/models/routes/request";
import { ApiController } from "./api-controller";

export interface RegenerateTokenController extends ApiController {
  get(req: Request, res: ApiResponse): Promise<void>;
}
