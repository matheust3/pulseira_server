import { EmailProvider } from '../../../application/gateways/email-provider'
import { EmailToken } from '../../models/email-token'

export class SendEmailTokenUseCase {
  private readonly emailProvider: EmailProvider

  constructor(emailProvider: EmailProvider) {
    this.emailProvider = emailProvider
  }

  public async execute(emailToken: EmailToken): Promise<void> {
    await this.emailProvider.sendEmail(
      emailToken.email,
      'Your crm token',
      `Your crm token is: ${emailToken.token}`,
      `Your crm token is: <b>${emailToken.token}</b>`,
    )
  }
}
