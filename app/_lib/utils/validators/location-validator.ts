import { number, object, ObjectSchema, string } from 'yup'
import { Location } from '../../core/domain/models/location'

export const locationValidator: ObjectSchema<Location> = object({
  latitude: number().required(),
  longitude: number().required(),
  userId: string().default(''),
})
