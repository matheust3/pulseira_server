import { InteractionRepository } from '../../../application/gateways/interaction-repository'
import { Candidate } from '../../models/interaction/candidate'

export class GetCandidates {
  private readonly interactionRepository: InteractionRepository

  constructor(args: { interactionRepository: InteractionRepository }) {
    this.interactionRepository = args.interactionRepository
  }

  async execute(args: { userId: string }): Promise<Candidate[]> {
    return this.interactionRepository.getCandidates(args.userId)
  }
}
