import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { dictionaryId, words } = body

    if (!dictionaryId || !Array.isArray(words) || words.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. Dictionary ID and words array required." },
        { status: 400 }
      )
    }

    // Verify dictionary exists
    const dictionary = await prisma.dictionary.findUnique({
      where: { id: dictionaryId },
    })

    if (!dictionary) {
      return NextResponse.json(
        { error: "Dictionary not found" },
        { status: 404 }
      )
    }

    // Get meaning parameter
    const meaningParam = await prisma.parameterDefinition.findUnique({
      where: { parameterKey: "meaning" },
    })

    if (!meaningParam) {
      return NextResponse.json(
        { error: "Meaning parameter not found" },
        { status: 500 }
      )
    }

    let created = 0
    let skipped = 0
    const errors: string[] = []

    // Process words in transaction
    for (const wordData of words) {
      try {
        // Validate required fields
        if (!wordData.wordMaithili || !wordData.meaningEnglish) {
          skipped++
          continue
        }

        // Check if word already exists
        const existing = await prisma.word.findFirst({
          where: {
            dictionaryId,
            wordMaithili: wordData.wordMaithili,
          },
        })

        if (existing) {
          skipped++
          continue
        }

        // Create word
        const word = await prisma.word.create({
          data: {
            dictionaryId,
            wordMaithili: wordData.wordMaithili.trim(),
            wordRomanized: wordData.wordRomanized?.trim() || null,
            pronunciation: wordData.pronunciation?.trim() || null,
            wordType: wordData.wordType?.trim() || null,
            status: "DRAFT",
            createdById: session.user.id,
          },
        })

        // Add English meaning
        await prisma.wordParameter.create({
          data: {
            wordId: word.id,
            parameterDefinitionId: meaningParam.id,
            parameterKey: "meaning",
            language: "english",
            contentText: wordData.meaningEnglish.trim(),
            isPrimary: true,
            orderIndex: 0,
          },
        })

        // Add Hindi meaning if provided
        if (wordData.meaningHindi?.trim()) {
          await prisma.wordParameter.create({
            data: {
              wordId: word.id,
              parameterDefinitionId: meaningParam.id,
              parameterKey: "meaning",
              language: "hindi",
              contentText: wordData.meaningHindi.trim(),
              isPrimary: false,
              orderIndex: 1,
            },
          })
        }

        created++
      } catch (error: any) {
        errors.push(`Error creating "${wordData.wordMaithili}": ${error.message}`)
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: words.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error in bulk word creation:", error)
    return NextResponse.json(
      { error: "Failed to create words" },
      { status: 500 }
    )
  }
}

