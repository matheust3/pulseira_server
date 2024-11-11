import { PhoneTokenProvider } from '../../../application/gateways/phone-token-provider'
import { PhoneTokenRepository } from '../../../application/gateways/phone-token-repository'

export class SendPhoneTokenUseCase {
  constructor(
    private readonly phoneTokenRepository: PhoneTokenRepository,
    private readonly phoneTokenProvider: PhoneTokenProvider,
  ) {}

  async send(phone: string): Promise<void> {
    const token = await this.phoneTokenProvider.generateToken(phone)
    await this.phoneTokenRepository.save(token)
    await this.phoneTokenProvider.sendToken(token)
  }
}
