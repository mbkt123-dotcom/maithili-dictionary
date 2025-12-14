import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dictionaryId = searchParams.get("dictionaryId")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))
    const skip = (page - 1) * limit

    const where: any = {}

    if (dictionaryId) {
      where.dictionaryId = dictionaryId
    }

    if (status) {
      where.status = status
    }

    if (search && search.trim().length > 0) {
      where.OR = [
        { wordMaithili: { contains: search.trim(), mode: "insensitive" } },
        { wordRomanized: { contains: search.trim(), mode: "insensitive" } },
      ]
    }

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          wordMaithili: true,
          wordRomanized: true,
          pronunciation: true,
          wordType: true,
          status: true,
          createdAt: true,
          dictionary: {
            select: {
              id: true,
              name: true,
              nameMaithili: true,
            },
          },
          parameters: {
            where: {
              parameterKey: "meaning",
              isPrimary: true,
            },
            take: 1,
            select: {
              contentText: true,
              language: true,
            },
          },
        },
        orderBy: {
          wordMaithili: "asc",
        },
      }),
      prisma.word.count({ where }),
    ])

    return NextResponse.json({
      words,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching words:", error)
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      dictionaryId,
      wordMaithili,
      wordRomanized,
      pronunciation,
      wordType,
      parameters,
    } = body

    // Validate required fields
    if (!dictionaryId || !wordMaithili) {
      return NextResponse.json(
        { error: "dictionaryId and wordMaithili are required" },
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

    // Create word with parameters in a transaction
    const word = await prisma.$transaction(async (tx) => {
      const newWord = await tx.word.create({
        data: {
          dictionaryId,
          wordMaithili: wordMaithili.trim(),
          wordRomanized: wordRomanized?.trim() || null,
          pronunciation: pronunciation?.trim() || null,
          wordType: wordType?.trim() || null,
          status: "DRAFT",
        },
      })

      // Batch create parameters
      if (parameters && Array.isArray(parameters) && parameters.length > 0) {
        const paramData = parameters
          .filter((param: any) => paramDefsMap.has(param.parameterKey))
          .map((param: any) => ({
            wordId: newWord.id,
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

      return newWord
    })

    // Fetch complete word data
    const wordWithParams = await prisma.word.findUnique({
      where: { id: word.id },
      select: {
        id: true,
        wordMaithili: true,
        wordRomanized: true,
        pronunciation: true,
        wordType: true,
        status: true,
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

    return NextResponse.json(wordWithParams, { status: 201 })
  } catch (error) {
    console.error("Error creating word:", error)
    return NextResponse.json(
      { error: "Failed to create word" },
      { status: 500 }
    )
  }
}

