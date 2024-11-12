import { ApiResponse } from "../../domain/models/routes/api-response";
import { Request } from "../../domain/models/routes/request";
import { ApiController } from "./api-controller";

export interface RecoverPasswordController extends ApiController {
  post(req: Request, res: ApiResponse): Promise<void>;
}
