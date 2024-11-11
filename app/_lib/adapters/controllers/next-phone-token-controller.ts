import { PhoneTokenController } from '../../core/application/controllers/phone-token-controller'
import { SendPhoneTokenUseCase } from '../../core/domain/usecases/phone-token/send-usecase'
import { NextRequest, NextResponse } from 'next/server'

export class NextPhoneTokenController implements PhoneTokenController {
  constructor(private readonly sendTokenUseCase: SendPhoneTokenUseCase) {}

  async send(req: NextRequest): Promise<NextResponse> {
    let json: { phone: string }

    try {
      json = await req.json()
    } catch (error) {
      return NextResponse.json({ error: 'A json is required' }, { status: 400 })
    }

    const { phone } = json
    if (phone === undefined) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    } else {
      await this.sendTokenUseCase.send(phone)
      return NextResponse.json({ message: 'Token sent' }, { status: 200 })
    }
  }
}
