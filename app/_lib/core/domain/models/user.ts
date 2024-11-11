import { Image } from './file/image'

export interface User {
  id: string
  email: string
  name: string
  description: string
  birthdate: Date
  gender: string
  genderInterest: string
  images: Image[]
  searchDistance: number
}
