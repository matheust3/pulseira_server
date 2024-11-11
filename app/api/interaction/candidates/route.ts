import { CandidatesControllerImpl } from '@/app/_lib/adapters/controllers/interaction/candidates/candidates-controller-impl'
import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

const controller = new CandidatesControllerImpl({
  getCandidates: dependencyContainer.useCases.getCandidatesUseCase,
})

export const GET = handler(async (req, res) => {
  await controller.get(req, res)
}, dependencyContainer.middlewares.authMiddleware)
