import { CandidatesController } from '@/app/_lib/core/application/controllers/interaction/candidates/candidates-controller'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { GetCandidates } from '@/app/_lib/core/domain/usecases/interaction/get-candidates'

export class CandidatesControllerImpl implements CandidatesController {
  private readonly getCandidates: GetCandidates

  constructor(args: { getCandidates: GetCandidates }) {
    this.getCandidates = args.getCandidates
  }

  async get(req: Request, res: ApiResponse): Promise<void> {
    if (req.authorization?.userId === undefined) {
      res.status = 401
      res.body = { message: 'Unauthorized' }
    } else {
      const candidates = await this.getCandidates.execute({
        userId: req.authorization.userId,
      })
      res.status = 200
      res.body = candidates
    }
  }
}
