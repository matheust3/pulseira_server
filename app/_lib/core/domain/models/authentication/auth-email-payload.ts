import { Token } from './token'

export interface AuthEmailPayload extends Token {
  tokenId: string
  token: string
  nExp?: number
}
