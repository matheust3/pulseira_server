import { PrismaClient } from '@prisma/client'
import { InteractionRepository } from '../../core/application/gateways/interaction-repository'
import { Candidate } from '../../core/domain/models/interaction/candidate'
import { ImageRepository } from '../../core/application/gateways/image-repository'
import { Image } from '../../core/domain/models/file/image'

export class InteractionRepositoryImpl implements InteractionRepository {
  private readonly prisma: PrismaClient
  private readonly imageRepository: ImageRepository

  constructor(args: {
    prismaClient: PrismaClient
    imageRepository: ImageRepository
  }) {
    this.prisma = args.prismaClient
    this.imageRepository = args.imageRepository
  }

  async getCandidates(userId: string): Promise<Candidate[]> {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { location: true },
    })
    if (!currentUser || !currentUser.location) {
      if (!currentUser) {
        throw new Error('User not found')
      } else {
        throw new Error('User Location not found')
      }
    } else {
      // Se o gênero de interesse do usuário for 'everyone', não filtrar por gênero
      const currentUserGenderInterest =
        currentUser.genderInterest === 'everyone'
          ? undefined
          : currentUser.genderInterest

      // Calcula os limites do bounding box para a busca de candidatos
      const { minLat, maxLat, minLon, maxLon } = this.calculateBoundingBox(
        currentUser.location.latitude,
        currentUser.location.longitude,
        currentUser.searchDistance,
      )

      // Buscar candidatos
      const matchingCandidates = await this.prisma.user.findMany({
        where: {
          id: { not: userId }, // O candidato não pode ser o próprio usuário
          images: { some: { flag: 'profile' } }, // O candidato deve ter pelo menos uma foto de perfil
          AND: [
            {
              OR: [
                {
                  // Se o gênero do candidato for igual ao gênero de interesse do usuário
                  // e o gênero de interesse do candidato for igual ao gênero do usuário
                  gender: currentUserGenderInterest,
                  genderInterest: currentUser.gender,
                },
                {
                  // Se o gênero do candidato for igual ao gênero de interesse do usuário
                  // e o gênero de interesse do candidato for igual a 'everyone'
                  gender: currentUserGenderInterest,
                  genderInterest: 'everyone',
                },
              ],
            },
          ],
          // Evitar candidatos já aprovados ou rejeitados sem atualização de fotos
          interactionsReceived: {
            none: {
              userId,
              OR: [
                {
                  updatedPhotos: false,
                  status: 'rejected',
                },
                {
                  status: 'approved',
                },
              ],
            },
          },
          // Filtro de localização
          location: {
            latitude: {
              gte: minLat,
              lte: maxLat,
            },
            longitude: {
              gte: minLon,
              lte: maxLon,
            },
          },
        },
        include: {
          location: true,
          images: true,
          description: true,
        },
        take: 20, // Limitar a quantidade de resultados
      })

      // Alguns candidatos possuem o raio de busca menor que a distância entre eles e o atual usuário
      // Nesse caso, a distância entre eles é maior que o raio de busca do candidato
      // Portanto, esses candidatos não devem ser retornados, pois eles não veriam o usuário atual na busca deles
      const filteredCandidates = matchingCandidates.filter((candidate) => {
        if (!candidate.location) {
          throw new Error('Candidate Location not found')
        }
        if (!currentUser.location) {
          throw new Error('User Location not found')
        }

        const { minLat, maxLat, minLon, maxLon } = this.calculateBoundingBox(
          candidate.location.latitude,
          candidate.location.longitude,
          candidate.searchDistance,
        )

        if (
          currentUser.location.latitude < minLat ||
          currentUser.location.latitude > maxLat ||
          currentUser.location.longitude < minLon ||
          currentUser.location.longitude > maxLon
        ) {
          return false
        } else {
          return true
        }
      })

      // Mapeia os candidatos para o modelo de domínio
      const candidates: Candidate[] = await Promise.all(
        filteredCandidates.map(async (candidate) => {
          const profileImages = candidate.images.filter(
            (image) => image.flag === 'profile',
          )

          const images = await Promise.all(
            profileImages.map(async (image) => {
              return {
                id: image.id,
                userId: image.userId,
                flag: image.flag,
                orderId: image.orderId,
                // Get the image url from the imageRepository
                url: await this.imageRepository.getImageUrlByFileKey(
                  image.fileKey,
                ),
              } as Image
            }),
          )

          if (!candidate.location) {
            throw new Error('Candidate Location not found')
          }
          if (!currentUser.location) {
            throw new Error('User Location not found')
          }

          return {
            id: candidate.id,
            age: this.calAge(candidate.birthdate),
            description: candidate.description?.content ?? '',
            distance: this.calculateDistance(
              {
                latitude: candidate.location.latitude,
                longitude: candidate.location.longitude,
              },
              {
                latitude: currentUser.location.latitude,
                longitude: currentUser.location.longitude,
              },
            ),
            images,
            gender: candidate.gender,
          }
        }),
      )

      return candidates
    }
  }

  // Calcula o bounding box para a busca de candidatos
  private calculateBoundingBox(
    latitude: number,
    longitude: number,
    distance: number,
  ): {
    minLat: number
    maxLat: number
    minLon: number
    maxLon: number
  } {
    const earthRadius = 111 // Aproximadamente 111 km por grau de latitude
    const latRadian = latitude * (Math.PI / 180) // Converter latitude para radianos

    const minLat = latitude - distance / earthRadius
    const maxLat = latitude + distance / earthRadius

    const minLon = longitude - distance / (earthRadius * Math.cos(latRadian))
    const maxLon = longitude + distance / (earthRadius * Math.cos(latRadian))

    return { minLat, maxLat, minLon, maxLon }
  }

  // Cálculo de idade
  private calAge(birthdate: Date): number {
    const today = new Date()
    let age = today.getFullYear() - birthdate.getFullYear()
    const m = today.getMonth() - birthdate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
      age--
    }
    return age
  }

  // Cálculo de distância em metros do usuário para o candidato
  private calculateDistance(
    candidateLocation: { latitude: number; longitude: number },
    userLocation: { latitude: number; longitude: number },
  ): number {
    const R = 6371e3 // metres
    const φ1 = (userLocation.latitude * Math.PI) / 180 // φ, λ in radians
    const φ2 = (candidateLocation.latitude * Math.PI) / 180
    const Δφ =
      ((candidateLocation.latitude - userLocation.latitude) * Math.PI) / 180
    const Δλ =
      ((candidateLocation.longitude - userLocation.longitude) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    const d = R * c // in metres
    return d
  }
}
