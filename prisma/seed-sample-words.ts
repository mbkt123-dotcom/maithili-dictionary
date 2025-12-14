import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample Maithili words with meanings
const sampleWords = [
  {
    wordMaithili: 'नमस्कार',
    wordRomanized: 'namaskar',
    pronunciation: '/nəməskɑːr/',
    wordType: 'noun',
    meaning: {
      english: 'Greeting, hello',
      hindi: 'नमस्कार, अभिवादन'
    }
  },
  {
    wordMaithili: 'धन्यवाद',
    wordRomanized: 'dhanyavad',
    pronunciation: '/dʱənjəvɑːd/',
    wordType: 'noun',
    meaning: {
      english: 'Thank you',
      hindi: 'धन्यवाद'
    }
  },
  {
    wordMaithili: 'पानी',
    wordRomanized: 'pani',
    pronunciation: '/pɑːni/',
    wordType: 'noun',
    meaning: {
      english: 'Water',
      hindi: 'पानी'
    }
  },
  {
    wordMaithili: 'खाना',
    wordRomanized: 'khana',
    pronunciation: '/kʰɑːnɑː/',
    wordType: 'noun',
    meaning: {
      english: 'Food',
      hindi: 'खाना'
    }
  },
  {
    wordMaithili: 'घर',
    wordRomanized: 'ghar',
    pronunciation: '/gʱər/',
    wordType: 'noun',
    meaning: {
      english: 'House, home',
      hindi: 'घर'
    }
  },
  {
    wordMaithili: 'माँ',
    wordRomanized: 'ma',
    pronunciation: '/mɑː/',
    wordType: 'noun',
    meaning: {
      english: 'Mother',
      hindi: 'माँ'
    }
  },
  {
    wordMaithili: 'बाबू',
    wordRomanized: 'babu',
    pronunciation: '/bɑːbu/',
    wordType: 'noun',
    meaning: {
      english: 'Father',
      hindi: 'पिता'
    }
  },
  {
    wordMaithili: 'भाई',
    wordRomanized: 'bhai',
    pronunciation: '/bʱɑːi/',
    wordType: 'noun',
    meaning: {
      english: 'Brother',
      hindi: 'भाई'
    }
  },
  {
    wordMaithili: 'बहिन',
    wordRomanized: 'bahin',
    pronunciation: '/bəhin/',
    wordType: 'noun',
    meaning: {
      english: 'Sister',
      hindi: 'बहन'
    }
  },
  {
    wordMaithili: 'किताब',
    wordRomanized: 'kitab',
    pronunciation: '/kitɑːb/',
    wordType: 'noun',
    meaning: {
      english: 'Book',
      hindi: 'किताब'
    }
  },
  {
    wordMaithili: 'स्कूल',
    wordRomanized: 'school',
    pronunciation: '/skuːl/',
    wordType: 'noun',
    meaning: {
      english: 'School',
      hindi: 'स्कूल'
    }
  },
  {
    wordMaithili: 'शिक्षक',
    wordRomanized: 'shikshak',
    pronunciation: '/ʃikʃək/',
    wordType: 'noun',
    meaning: {
      english: 'Teacher',
      hindi: 'शिक्षक'
    }
  },
  {
    wordMaithili: 'विद्यार्थी',
    wordRomanized: 'vidyarthi',
    pronunciation: '/vidjɑːrtʰi/',
    wordType: 'noun',
    meaning: {
      english: 'Student',
      hindi: 'विद्यार्थी'
    }
  },
  {
    wordMaithili: 'सूर्य',
    wordRomanized: 'surya',
    pronunciation: '/surjə/',
    wordType: 'noun',
    meaning: {
      english: 'Sun',
      hindi: 'सूर्य'
    }
  },
  {
    wordMaithili: 'चंद्रमा',
    wordRomanized: 'chandrama',
    pronunciation: '/tʃəndrəmɑː/',
    wordType: 'noun',
    meaning: {
      english: 'Moon',
      hindi: 'चंद्रमा'
    }
  },
  {
    wordMaithili: 'तारा',
    wordRomanized: 'tara',
    pronunciation: '/tɑːrɑː/',
    wordType: 'noun',
    meaning: {
      english: 'Star',
      hindi: 'तारा'
    }
  },
  {
    wordMaithili: 'पेड़',
    wordRomanized: 'ped',
    pronunciation: '/peɽ/',
    wordType: 'noun',
    meaning: {
      english: 'Tree',
      hindi: 'पेड़'
    }
  },
  {
    wordMaithili: 'फूल',
    wordRomanized: 'phul',
    pronunciation: '/pʰuːl/',
    wordType: 'noun',
    meaning: {
      english: 'Flower',
      hindi: 'फूल'
    }
  },
  {
    wordMaithili: 'पक्षी',
    wordRomanized: 'pakshi',
    pronunciation: '/pəkʃi/',
    wordType: 'noun',
    meaning: {
      english: 'Bird',
      hindi: 'पक्षी'
    }
  },
  {
    wordMaithili: 'कुत्ता',
    wordRomanized: 'kutta',
    pronunciation: '/kuttɑː/',
    wordType: 'noun',
    meaning: {
      english: 'Dog',
      hindi: 'कुत्ता'
    }
  },
  {
    wordMaithili: 'बिल्ली',
    wordRomanized: 'billi',
    pronunciation: '/billi/',
    wordType: 'noun',
    meaning: {
      english: 'Cat',
      hindi: 'बिल्ली'
    }
  },
  {
    wordMaithili: 'गाय',
    wordRomanized: 'gay',
    pronunciation: '/gɑːj/',
    wordType: 'noun',
    meaning: {
      english: 'Cow',
      hindi: 'गाय'
    }
  },
  {
    wordMaithili: 'हाथी',
    wordRomanized: 'hathi',
    pronunciation: '/hɑːtʰi/',
    wordType: 'noun',
    meaning: {
      english: 'Elephant',
      hindi: 'हाथी'
    }
  },
  {
    wordMaithili: 'सुंदर',
    wordRomanized: 'sundar',
    pronunciation: '/sundər/',
    wordType: 'adjective',
    meaning: {
      english: 'Beautiful',
      hindi: 'सुंदर'
    }
  },
  {
    wordMaithili: 'बड़ा',
    wordRomanized: 'bada',
    pronunciation: '/bəɽɑː/',
    wordType: 'adjective',
    meaning: {
      english: 'Big, large',
      hindi: 'बड़ा'
    }
  },
  {
    wordMaithili: 'छोटा',
    wordRomanized: 'chhota',
    pronunciation: '/tʃʰotɑː/',
    wordType: 'adjective',
    meaning: {
      english: 'Small',
      hindi: 'छोटा'
    }
  },
  {
    wordMaithili: 'अच्छा',
    wordRomanized: 'accha',
    pronunciation: '/ətʃtʃʰɑː/',
    wordType: 'adjective',
    meaning: {
      english: 'Good',
      hindi: 'अच्छा'
    }
  },
  {
    wordMaithili: 'बुरा',
    wordRomanized: 'bura',
    pronunciation: '/burɑː/',
    wordType: 'adjective',
    meaning: {
      english: 'Bad',
      hindi: 'बुरा'
    }
  },
  {
    wordMaithili: 'गर्म',
    wordRomanized: 'garm',
    pronunciation: '/gərm/',
    wordType: 'adjective',
    meaning: {
      english: 'Hot',
      hindi: 'गर्म'
    }
  },
  {
    wordMaithili: 'ठंडा',
    wordRomanized: 'thanda',
    pronunciation: '/tʰəndɑː/',
    wordType: 'adjective',
    meaning: {
      english: 'Cold',
      hindi: 'ठंडा'
    }
  },
  {
    wordMaithili: 'जाना',
    wordRomanized: 'jana',
    pronunciation: '/dʒɑːnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To go',
      hindi: 'जाना'
    }
  },
  {
    wordMaithili: 'आना',
    wordRomanized: 'ana',
    pronunciation: '/ɑːnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To come',
      hindi: 'आना'
    }
  },
  {
    wordMaithili: 'खाना',
    wordRomanized: 'khana',
    pronunciation: '/kʰɑːnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To eat',
      hindi: 'खाना'
    }
  },
  {
    wordMaithili: 'पीना',
    wordRomanized: 'pina',
    pronunciation: '/piːnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To drink',
      hindi: 'पीना'
    }
  },
  {
    wordMaithili: 'सोना',
    wordRomanized: 'sona',
    pronunciation: '/sonɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To sleep',
      hindi: 'सोना'
    }
  },
  {
    wordMaithili: 'उठना',
    wordRomanized: 'uthna',
    pronunciation: '/utʰnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To wake up, to get up',
      hindi: 'उठना'
    }
  },
  {
    wordMaithili: 'बोलना',
    wordRomanized: 'bolna',
    pronunciation: '/bolnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To speak',
      hindi: 'बोलना'
    }
  },
  {
    wordMaithili: 'सुनना',
    wordRomanized: 'sunna',
    pronunciation: '/sunnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To listen, to hear',
      hindi: 'सुनना'
    }
  },
  {
    wordMaithili: 'देखना',
    wordRomanized: 'dekhna',
    pronunciation: '/dekʰnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To see, to look',
      hindi: 'देखना'
    }
  },
  {
    wordMaithili: 'पढ़ना',
    wordRomanized: 'padhna',
    pronunciation: '/pəɽʱnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To read, to study',
      hindi: 'पढ़ना'
    }
  },
  {
    wordMaithili: 'लिखना',
    wordRomanized: 'likhna',
    pronunciation: '/likʰnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To write',
      hindi: 'लिखना'
    }
  },
  {
    wordMaithili: 'करना',
    wordRomanized: 'karna',
    pronunciation: '/kərnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To do',
      hindi: 'करना'
    }
  },
  {
    wordMaithili: 'मिलना',
    wordRomanized: 'milna',
    pronunciation: '/milnɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To meet, to get',
      hindi: 'मिलना'
    }
  },
  {
    wordMaithili: 'देना',
    wordRomanized: 'dena',
    pronunciation: '/denɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To give',
      hindi: 'देना'
    }
  },
  {
    wordMaithili: 'लेना',
    wordRomanized: 'lena',
    pronunciation: '/lenɑː/',
    wordType: 'verb',
    meaning: {
      english: 'To take',
      hindi: 'लेना'
    }
  },
  {
    wordMaithili: 'रंग',
    wordRomanized: 'rang',
    pronunciation: '/rəŋg/',
    wordType: 'noun',
    meaning: {
      english: 'Color',
      hindi: 'रंग'
    }
  },
  {
    wordMaithili: 'समय',
    wordRomanized: 'samay',
    pronunciation: '/səməj/',
    wordType: 'noun',
    meaning: {
      english: 'Time',
      hindi: 'समय'
    }
  },
  {
    wordMaithili: 'दिन',
    wordRomanized: 'din',
    pronunciation: '/din/',
    wordType: 'noun',
    meaning: {
      english: 'Day',
      hindi: 'दिन'
    }
  },
  {
    wordMaithili: 'रात',
    wordRomanized: 'rat',
    pronunciation: '/rɑːt/',
    wordType: 'noun',
    meaning: {
      english: 'Night',
      hindi: 'रात'
    }
  },
  {
    wordMaithili: 'प्रेम',
    wordRomanized: 'prem',
    pronunciation: '/prem/',
    wordType: 'noun',
    meaning: {
      english: 'Love',
      hindi: 'प्रेम'
    }
  },
  {
    wordMaithili: 'मित्र',
    wordRomanized: 'mitra',
    pronunciation: '/mitrə/',
    wordType: 'noun',
    meaning: {
      english: 'Friend',
      hindi: 'मित्र'
    }
  }
]

async function main() {
  console.log('Starting to seed sample words...')

  // Get main dictionary
  const mainDictionary = await prisma.dictionary.findFirst({
    where: { isMain: true },
  })

  if (!mainDictionary) {
    console.error('Main dictionary not found. Please run the main seed script first.')
    process.exit(1)
  }

  // Get parameter definitions
  const meaningParam = await prisma.parameterDefinition.findUnique({
    where: { parameterKey: 'meaning' },
  })

  if (!meaningParam) {
    console.error('Meaning parameter not found. Please run the main seed script first.')
    process.exit(1)
  }

  let created = 0
  let skipped = 0

  for (const wordData of sampleWords) {
    try {
      // Check if word already exists
      const existing = await prisma.word.findFirst({
        where: {
          dictionaryId: mainDictionary.id,
          wordMaithili: wordData.wordMaithili,
        },
      })

      if (existing) {
        console.log(`Skipping "${wordData.wordMaithili}" - already exists`)
        skipped++
        continue
      }

      // Create word
      const word = await prisma.word.create({
        data: {
          dictionaryId: mainDictionary.id,
          wordMaithili: wordData.wordMaithili,
          wordRomanized: wordData.wordRomanized,
          pronunciation: wordData.pronunciation,
          wordType: wordData.wordType,
          status: 'PUBLISHED',
          isPublished: true,
          isConcise: true,
        },
      })

      // Add English meaning
      await prisma.wordParameter.create({
        data: {
          wordId: word.id,
          parameterDefinitionId: meaningParam.id,
          parameterKey: 'meaning',
          language: 'english',
          contentText: wordData.meaning.english,
          isPrimary: true,
          orderIndex: 0,
        },
      })

      // Add Hindi meaning
      await prisma.wordParameter.create({
        data: {
          wordId: word.id,
          parameterDefinitionId: meaningParam.id,
          parameterKey: 'meaning',
          language: 'hindi',
          contentText: wordData.meaning.hindi,
          isPrimary: false,
          orderIndex: 1,
        },
      })

      console.log(`Created: ${wordData.wordMaithili} (${wordData.wordRomanized})`)
      created++
    } catch (error) {
      console.error(`Error creating word "${wordData.wordMaithili}":`, error)
    }
  }

  console.log(`\n✅ Sample words seeding complete!`)
  console.log(`   Created: ${created} words`)
  console.log(`   Skipped: ${skipped} words (already exist)`)
  console.log(`   Total: ${sampleWords.length} words processed`)
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

