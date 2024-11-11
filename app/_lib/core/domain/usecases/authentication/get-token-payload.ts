import { AuthEmailPayload } from '../../models/authentication/auth-email-payload'

export class GetTokenPayload {
  async execute(token: string): Promise<AuthEmailPayload> {
    const tokeSplitted = token.split('.')
    const payload = JSON.parse(
      Buffer.from(tokeSplitted[1], 'base64').toString('utf-8'),
    )
    const data = payload.data
    delete payload.data
    return { ...payload, ...data }
  }
}
