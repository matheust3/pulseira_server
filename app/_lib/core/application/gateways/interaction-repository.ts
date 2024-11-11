import { Candidate } from '../../domain/models/interaction/candidate'

export interface InteractionRepository {
  getCandidates(userId: string): Promise<Candidate[]>
}
