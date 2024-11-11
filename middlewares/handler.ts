import { nextRequestAdapter } from '@/app/_lib/adapters/next-request-adapter'
import { toNextResponseAdapter } from '@/app/_lib/adapters/to-next-response-adapter'
import { ApiResponse } from '@/app/_lib/core/domain/models/routes/api-response'
import { Middleware } from '@/app/_lib/core/domain/models/routes/middleware'
import { Request } from '@/app/_lib/core/domain/models/routes/request'
import { NextRequest, NextResponse } from 'next/server'

type Route = (request: Request, response: ApiResponse) => Promise<void>

export const handler =
  (route: Route, ...middleware: Middleware[]) =>
  async (request: NextRequest): Promise<NextResponse> => {
    const response: ApiResponse = {
      status: 500,
      body: {},
      headers: new Headers(),
    }
    const req = nextRequestAdapter(request)
    let nextInvoked = false
    for (let i = 0; i < middleware.length; i++) {
      nextInvoked = false
      const next = async (): Promise<void> => {
        nextInvoked = true
      }
      // Chama cada middleware
      // Se algum middleware falhar, retorna 500
      try {
        await middleware[i].handler(req, response, next)
      } catch (e) {
        console.error(e)
        response.status = 500
        response.body = { message: 'Internal Server Error' }
        nextInvoked = false
        break
      }
      if (!nextInvoked) {
        break
      }
    }
    if (nextInvoked || middleware.length === 0) {
      // Se todos os middlewares passarem, chama a rota
      // Se a rota falhar, retorna 500
      try {
        await route(req, response)
      } catch (e) {
        console.error(e)
        response.status = 500
        response.body = { message: 'Internal Server Error' }
      }
    }
    return toNextResponseAdapter(response)
  }
