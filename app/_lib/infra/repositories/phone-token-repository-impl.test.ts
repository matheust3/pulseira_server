import { PrismaClient } from '@prisma/client'
import { DeepMockProxy, mock, mockDeep } from 'jest-mock-extended'
import { PhoneTokenRepositoryImpl } from './phone-token-repository-impl'
import { PhoneToken } from '../../core/domain/models/phone-token'

interface SutTypes {
  sut: PhoneTokenRepositoryImpl
  prismClientStub: DeepMockProxy<PrismaClient>
}

const makeSut = (): SutTypes => {
  const prismClientStub = mockDeep<PrismaClient>()
  const sut = new PhoneTokenRepositoryImpl(prismClientStub)
  return { sut, prismClientStub }
}

describe('phone-token-repository-impl.test.ts - save', () => {
  test('ensure call upsert with correct params', async () => {
    //! Arrange
    const { sut, prismClientStub } = makeSut()
    const toke: PhoneToken = {
      id: 'id',
      phone: 'phone',
      token: 'token',
      createdAt: 'created',
      updatedAt: 'updated',
    }
    //! Act
    await sut.save(toke)
    //! Assert
    expect(prismClientStub.phoneToken.upsert).toHaveBeenCalledWith({
      create: {
        phone: toke.phone,
        token: toke.token,
        id: toke.id,
        createdAt: toke.createdAt,
        updatedAt: toke.updatedAt,
      },
      update: {
        phone: toke.phone,
        token: toke.token,
        id: toke.id,
        createdAt: toke.createdAt,
        updatedAt: toke.updatedAt,
      },
      where: {
        phone: toke.phone,
      },
    })
  })

  test('ensure throws if prisma throws', () => {
    //! Arrange
    const { sut, prismClientStub } = makeSut()
    prismClientStub.phoneToken.upsert.mockRejectedValueOnce(new Error())
    const token = mock<PhoneToken>()
    //! Act
    //! Assert
    expect(sut.save(token)).rejects.toThrow()
  })
})
