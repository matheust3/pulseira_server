import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

async function loadData() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  // Carregue os dados do arquivo JSON
  console.log('Loading data from JSON...')
  const filePath = path.resolve(
    path.join(__dirname, '..', 'data', 'estados-cidades.json'),
  )
  const data = JSON.parse(await fs.readFile(filePath, 'utf-8'))
  return data
}

async function truncateTables(prisma) {
  // Truncate tables
  console.log('Truncating tables...')
  await prisma.city.deleteMany()
  await prisma.state.deleteMany()
  console.log('Tables truncated!')
}

async function insertData(prisma, data) {
  const states = []
  data.estados.forEach(async (state) => {
    const { sigla, nome, cidades } = state
    states.push({
      abbreviation: sigla.toUpperCase(),
      name: nome,
      cities: cidades.map((cidade) => ({ name: cidade })),
    })
  })

  // Insira os dados no banco de dados
  console.log('Inserting data into the database...')
  for (const state of states) {
    await prisma.state.create({
      data: {
        abbreviation: state.abbreviation,
        name: state.name,
        cities: {
          createMany: {
            data: state.cities,
          },
        },
      },
    })
  }
  console.log('Data inserted successfully!')
}

async function main() {
  console.log('Connecting to the database...')
  const prisma = new PrismaClient()
  await prisma.$connect()
  await truncateTables(prisma)
  const data = await loadData()
  await insertData(prisma, data)
  await prisma.$disconnect()
}

main().catch(console.error)
