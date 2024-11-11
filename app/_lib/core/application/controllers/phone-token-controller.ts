import { NextRequest, NextResponse } from 'next/server'

export interface PhoneTokenController {
  send(req: NextRequest): Promise<NextResponse>
}
