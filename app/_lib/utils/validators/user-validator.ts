import { ObjectSchema, array, date, number, object, string } from 'yup'
import { User } from '../../core/domain/models/user'

export const userValidator: ObjectSchema<User> = object({
  id: string().default(''),
  email: string().email().required(),
  name: string().required(),
  images: array().required(),
  searchDistance: number().required().max(200),
  // lass than 18
  birthdate: date()
    .required()
    .max(
      new Date(new Date().setFullYear(new Date().getFullYear() - 18)),
      'birthdate must be greater than or equal to 18 years old',
    ),
  gender: string()
    .required()
    .matches(/(male|female)/),
  description: string().ensure().max(500),
  genderInterest: string()
    .required()
    .matches(/(male|female|everyone)/),
})
