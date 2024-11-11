import { ObjectSchema, number, object, string } from 'yup'
import { Image } from '@/app/_lib/core/domain/models/file/image'

export const imageValidator: ObjectSchema<Image> = object({
  id: string().required(),
  orderId: number().required(),
  userId: string().required(),
  url: string().required(),
  flag: string().oneOf(['id', 'profile']).required(),
})
