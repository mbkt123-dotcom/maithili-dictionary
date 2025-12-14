import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// List of sample words to remove (romanized forms for identification)
const sampleWordsToRemove = [
  'namaskar',
  'dhanyavad',
  'pani',
  'khana',
  'ghar',
  'ma',
  'babu',
  'bhai',
  'bahin',
  'kitab',
  'school',
  'shikshak',
  'vidyarthi',
  'surya',
  'chandrama',
  'tara',
  'ped',
  'phul',
  'pakshi',
  'kutta',
  'billi',
  'gay',
  'hathi',
  'sundar',
  'bada',
  'chhota',
  'accha',
  'bura',
  'garm',
  'thanda',
  'jana',
  'ana',
  'pina',
  'sona',
  'uthna',
  'bolna',
  'sunna',
  'dekhna',
  'padhna',
  'likhna',
  'karna',
  'milna',
  'dena',
  'lena',
  'rang',
  'samay',
  'din',
  'rat',
  'prem',
  'mitra'
]

async function main() {
  console.log('Starting to remove sample words...')

  // Get main dictionary
  const mainDictionary = await prisma.dictionary.findFirst({
    where: { isMain: true },
  })

  if (!mainDictionary) {
    console.error('Main dictionary not found.')
    process.exit(1)
  }

  let removed = 0
  let notFound = 0

  for (const romanized of sampleWordsToRemove) {
    try {
      const word = await prisma.word.findFirst({
        where: {
          dictionaryId: mainDictionary.id,
          wordRomanized: romanized,
        },
      })

      if (word) {
        // Delete word (cascades to parameters)
        await prisma.word.delete({
          where: { id: word.id },
        })
        console.log(`Removed: ${word.wordMaithili} (${romanized})`)
        removed++
      } else {
        console.log(`Not found: ${romanized}`)
        notFound++
      }
    } catch (error) {
      console.error(`Error removing word "${romanized}":`, error)
    }
  }

  console.log(`\n✅ Sample words removal complete!`)
  console.log(`   Removed: ${removed} words`)
  console.log(`   Not found: ${notFound} words`)
  console.log(`   Total: ${sampleWordsToRemove.length} words processed`)
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

