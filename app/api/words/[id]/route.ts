import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const word = await prisma.word.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        wordMaithili: true,
        wordRomanized: true,
        pronunciation: true,
        wordType: true,
        status: true,
        isSubWord: true,
        subWordOrder: true,
        versionNumber: true,
        isPublished: true,
        viewCount: true,
        searchCount: true,
        createdAt: true,
        updatedAt: true,
        dictionary: {
          select: {
            id: true,
            name: true,
            nameMaithili: true,
            sourceLanguage: true,
            targetLanguages: true,
          },
        },
        parameters: {
          select: {
            id: true,
            parameterKey: true,
            language: true,
            contentText: true,
            contentJson: true,
            contentRichText: true,
            isPrimary: true,
            orderIndex: true,
            parameterDefinition: {
              select: {
                id: true,
                parameterKey: true,
                parameterName: true,
                parameterType: true,
              },
            },
          },
          orderBy: {
            orderIndex: "asc",
          },
        },
        relationships: {
          select: {
            id: true,
            relationshipType: true,
            relationshipNote: true,
            targetWord: {
              select: {
                id: true,
                wordMaithili: true,
                wordRomanized: true,
              },
            },
          },
        },
        subWords: {
          select: {
            id: true,
            wordMaithili: true,
            wordRomanized: true,
            subWordOrder: true,
          },
          orderBy: {
            subWordOrder: "asc",
          },
        },
        parentWord: {
          select: {
            id: true,
            wordMaithili: true,
            wordRomanized: true,
          },
        },
      },
    })

    if (!word) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 })
    }

    // Increment view count asynchronously (non-blocking)
    prisma.word.update({
      where: { id: params.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    }).catch((error) => {
      console.error("Error updating view count:", error)
    })

    return NextResponse.json(word)
  } catch (error) {
    console.error("Error fetching word:", error)
    return NextResponse.json(
      { error: "Failed to fetch word" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      wordMaithili,
      wordRomanized,
      pronunciation,
      wordType,
      status,
      parameters,
    } = body

    // Validate required fields
    if (!wordMaithili) {
      return NextResponse.json(
        { error: "wordMaithili is required" },
        { status: 400 }
      )
    }

    // Batch fetch parameter definitions if parameters provided
    let paramDefsMap = new Map()
    if (parameters && Array.isArray(parameters) && parameters.length > 0) {
      const paramKeys = [...new Set(parameters.map((p: any) => p.parameterKey))]
      const paramDefs = await prisma.parameterDefinition.findMany({
        where: { parameterKey: { in: paramKeys } },
        select: { id: true, parameterKey: true },
      })
      paramDefs.forEach(def => paramDefsMap.set(def.parameterKey, def.id))
    }

    // Update word and parameters in a transaction
    const updatedWord = await prisma.$transaction(async (tx) => {
      // Update word
      const word = await tx.word.update({
        where: { id: params.id },
        data: {
          wordMaithili: wordMaithili.trim(),
          wordRomanized: wordRomanized?.trim() || null,
          pronunciation: pronunciation?.trim() || null,
          wordType: wordType?.trim() || null,
          status: status || undefined,
          versionNumber: { increment: 1 },
        },
      })

      // Update parameters if provided
      if (parameters && Array.isArray(parameters) && parameters.length > 0) {
        // Delete existing parameters
        await tx.wordParameter.deleteMany({
          where: { wordId: params.id },
        })

        // Batch create new parameters
        const paramData = parameters
          .filter((param: any) => paramDefsMap.has(param.parameterKey))
          .map((param: any) => ({
            wordId: params.id,
            parameterDefinitionId: paramDefsMap.get(param.parameterKey),
            parameterKey: param.parameterKey,
            language: param.language || null,
            contentText: param.contentText || null,
            contentJson: param.contentJson || null,
            contentRichText: param.contentRichText || null,
            isPrimary: param.isPrimary || false,
            orderIndex: param.orderIndex || 0,
          }))

        if (paramData.length > 0) {
          await tx.wordParameter.createMany({ data: paramData })
        }
      }

      // Fetch complete updated word
      return tx.word.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          wordMaithili: true,
          wordRomanized: true,
          pronunciation: true,
          wordType: true,
          status: true,
          versionNumber: true,
          parameters: {
            select: {
              id: true,
              parameterKey: true,
              language: true,
              contentText: true,
              contentJson: true,
              contentRichText: true,
              isPrimary: true,
              orderIndex: true,
            },
            orderBy: {
              orderIndex: "asc",
            },
          },
          dictionary: {
            select: {
              id: true,
              name: true,
              nameMaithili: true,
            },
          },
        },
      })
    })

    return NextResponse.json(updatedWord)
  } catch (error) {
    console.error("Error updating word:", error)
    return NextResponse.json(
      { error: "Failed to update word" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.word.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Word deleted" })
  } catch (error) {
    console.error("Error deleting word:", error)
    return NextResponse.json(
      { error: "Failed to delete word" },
      { status: 500 }
    )
  }
}

