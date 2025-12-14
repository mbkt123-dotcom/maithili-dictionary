import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const dictionaryId = searchParams.get("dictionaryId")
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")))

    if (!q || q.length < 2) {
      return NextResponse.json({ words: [] })
    }

    const where: any = {
      OR: [
        { wordMaithili: { contains: q, mode: "insensitive" } },
        { wordRomanized: { contains: q, mode: "insensitive" } },
      ],
      isPublished: true,
    }

    if (dictionaryId) {
      where.dictionaryId = dictionaryId
    }

    const [words] = await Promise.all([
      prisma.word.findMany({
        where,
        take: limit,
        select: {
          id: true,
          wordMaithili: true,
          wordRomanized: true,
          pronunciation: true,
          wordType: true,
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
            take: 3,
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
      // Log search asynchronously (non-blocking)
      prisma.searchHistory.create({
        data: {
          queryText: q,
          dictionaryId: dictionaryId || null,
        },
      }).catch(() => {
        // Ignore logging errors
      }),
    ])

    return NextResponse.json({ words })
  } catch (error) {
    console.error("Error searching words:", error)
    return NextResponse.json(
      { error: "Failed to search words" },
      { status: 500 }
    )
  }
}

