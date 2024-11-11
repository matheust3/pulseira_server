import { Image } from '../file/image'

export interface Candidate {
  id: string
  description: string
  age: number
  gender: string
  images: Image[]
  distance: number
}
