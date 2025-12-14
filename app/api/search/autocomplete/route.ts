import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const dictionaryId = searchParams.get("dictionaryId")
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") || "8")))

    if (!q || q.length < 1) {
      return NextResponse.json({ suggestions: [] })
    }

    const where: any = {
      OR: [
        { wordMaithili: { startsWith: q, mode: "insensitive" } },
        { wordRomanized: { startsWith: q, mode: "insensitive" } },
      ],
      isPublished: true,
    }

    if (dictionaryId) {
      where.dictionaryId = dictionaryId
    }

    const words = await prisma.word.findMany({
      where,
      take: limit,
      select: {
        id: true,
        wordMaithili: true,
        wordRomanized: true,
        dictionary: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        wordMaithili: "asc",
      },
    })

    const suggestions = words.map((word) => ({
      id: word.id,
      word: word.wordMaithili,
      romanized: word.wordRomanized,
      dictionary: word.dictionary.name,
    }))

    return NextResponse.json({ suggestions })
  } catch (error) {
    console.error("Error fetching autocomplete:", error)
    return NextResponse.json(
      { error: "Failed to fetch autocomplete" },
      { status: 500 }
    )
  }
}

