import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create main dictionary (MLRC)
  const mainDictionary = await prisma.dictionary.upsert({
    where: { id: 'main-dict-001' },
    update: {},
    create: {
      id: 'main-dict-001',
      name: 'Main Dictionary',
      nameMaithili: 'मुख्य शब्दकोश',
      sourceLanguage: 'maithili',
      targetLanguages: ['hindi', 'english'],
      isMain: true,
      isActive: true,
      description: 'Main dictionary by Maithili Linguistics Research Council',
    },
  })

  // Create default parameter definitions
  const parameters = [
    {
      parameterKey: 'meaning',
      parameterName: 'Meaning',
      parameterNameMaithili: 'अर्थ',
      parameterType: 'MULTILINGUAL' as const,
      isMultilingual: true,
      supportedLanguages: ['hindi', 'english', 'sanskrit'],
      isRequired: true,
      orderIndex: 1,
    },
    {
      parameterKey: 'etymology',
      parameterName: 'Etymology',
      parameterNameMaithili: 'व्युत्पत्ति',
      parameterType: 'TEXT' as const,
      isMultilingual: false,
      isRequired: false,
      orderIndex: 2,
    },
    {
      parameterKey: 'examples',
      parameterName: 'Examples',
      parameterNameMaithili: 'उदाहरण',
      parameterType: 'ARRAY' as const,
      isMultilingual: false,
      isRequired: false,
      orderIndex: 3,
    },
    {
      parameterKey: 'usage',
      parameterName: 'Usage',
      parameterNameMaithili: 'प्रयोग',
      parameterType: 'TEXT' as const,
      isMultilingual: false,
      isRequired: false,
      orderIndex: 4,
    },
  ]

  for (const param of parameters) {
    await prisma.parameterDefinition.upsert({
      where: { parameterKey: param.parameterKey },
      update: {},
      create: param,
    })
  }

  console.log('Seed data created successfully')
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

