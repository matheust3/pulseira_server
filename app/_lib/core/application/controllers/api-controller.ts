import { ApiResponse } from "../../domain/models/routes/api-response";
import { Request } from "../../domain/models/routes/request";

export interface ApiController {
  get?(req: Request, res: ApiResponse): Promise<void>;
  post?(req: Request, res: ApiResponse): Promise<void>;
  put?(req: Request, res: ApiResponse): Promise<void>;
  delete?(req: Request, res: ApiResponse): Promise<void>;
}
