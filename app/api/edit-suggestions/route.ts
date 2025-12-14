import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [suggestions, total] = await Promise.all([
      prisma.editSuggestion.findMany({
        where,
        skip,
        take: limit,
        include: {
          word: {
            select: {
              id: true,
              wordMaithili: true,
              wordRomanized: true,
            },
          },
          dictionary: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.editSuggestion.count({ where }),
    ])

    return NextResponse.json({
      suggestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching edit suggestions:", error)
    return NextResponse.json(
      { error: "Failed to fetch edit suggestions" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      wordId,
      dictionaryId,
      suggestionType,
      email,
      phone,
      name,
      suggestionData,
      parameterSuggestions,
    } = body

    // Validate required fields
    if (!email || !phone || !dictionaryId || !suggestionType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Only allow suggestions for main dictionary
    const dictionary = await prisma.dictionary.findUnique({
      where: { id: dictionaryId },
    })

    if (!dictionary || !dictionary.isMain) {
      return NextResponse.json(
        { error: "Suggestions can only be made for the main dictionary" },
        { status: 400 }
      )
    }

    const suggestion = await prisma.editSuggestion.create({
      data: {
        wordId: wordId || null,
        dictionaryId,
        suggestionType,
        email,
        phone,
        name: name || null,
        suggestionData,
        parameterSuggestions: parameterSuggestions || null,
        status: "PENDING",
      },
    })

    return NextResponse.json(suggestion, { status: 201 })
  } catch (error) {
    console.error("Error creating edit suggestion:", error)
    return NextResponse.json(
      { error: "Failed to create edit suggestion" },
      { status: 500 }
    )
  }
}

