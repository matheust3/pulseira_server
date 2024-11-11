import { dependencyContainer } from '@/app/_lib/config/dependency-container'
import { handler } from '@/middlewares'

export const GET = handler(async (req, res) => {
  res.body = { message: 'Hello World' }
  res.status = 200
}, dependencyContainer.middlewares.authMiddleware)
