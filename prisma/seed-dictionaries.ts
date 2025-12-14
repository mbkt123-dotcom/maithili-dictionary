import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating dictionaries...')

  const dictionaries = [
    {
      id: 'mlrc-main',
      name: 'MLRC',
      nameMaithili: 'एमएलआरसी',
      sourceLanguage: 'maithili',
      targetLanguages: ['hindi', 'english'],
      isMain: true,
      isActive: true,
      description: 'Main dictionary by Maithili Linguistics Research Council',
    },
    {
      id: 'kalyani-sabdkosh',
      name: 'Kalyani Sabdkosh',
      nameMaithili: 'कल्याणी शब्दकोश',
      sourceLanguage: 'maithili',
      targetLanguages: ['hindi', 'english'],
      isMain: false,
      isActive: true,
      description: 'Kalyani Sabdkosh - Comprehensive Maithili dictionary',
    },
    {
      id: 'jaikant-sabdkosh',
      name: 'Jaikant ji Sabdkosh',
      nameMaithili: 'जयकांत जी शब्दकोश',
      sourceLanguage: 'maithili',
      targetLanguages: ['hindi', 'english'],
      isMain: false,
      isActive: true,
      description: 'Jaikant ji Sabdkosh - Maithili dictionary collection',
    },
  ]

  for (const dict of dictionaries) {
    try {
      await prisma.dictionary.upsert({
        where: { id: dict.id },
        update: dict,
        create: dict,
      })
      console.log(`✅ Created/Updated: ${dict.name}`)
    } catch (error) {
      console.error(`Error creating ${dict.name}:`, error)
    }
  }

  console.log('\n✅ Dictionaries created successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

