import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const suggestion = await prisma.editSuggestion.findUnique({
      where: { id: params.id },
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      )
    }

    // Update suggestion status
    await prisma.editSuggestion.update({
      where: { id: params.id },
      data: {
        status: "APPROVED",
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    })

    // Create or update word based on suggestion
    if (suggestion.suggestionType === "ADD_NEW_WORD") {
      // Create new word
      const wordData = suggestion.suggestionData as any
      const word = await prisma.word.create({
        data: {
          dictionaryId: suggestion.dictionaryId,
          wordMaithili: wordData.wordMaithili || "",
          wordRomanized: wordData.wordRomanized || null,
          pronunciation: wordData.pronunciation || null,
          wordType: wordData.wordType || null,
          status: "DRAFT",
          createdById: session.user.id,
        },
      })

      // Add parameters if provided
      if (suggestion.parameterSuggestions) {
        const paramSuggestions = suggestion.parameterSuggestions as any[]
        for (const paramSuggestion of paramSuggestions) {
          const paramDef = await prisma.parameterDefinition.findUnique({
            where: { parameterKey: paramSuggestion.parameterKey },
          })

          if (paramDef) {
            await prisma.wordParameter.create({
              data: {
                wordId: word.id,
                parameterDefinitionId: paramDef.id,
                parameterKey: paramSuggestion.parameterKey,
                language: paramSuggestion.language || null,
                contentText: paramSuggestion.contentText || null,
                contentJson: paramSuggestion.contentJson || null,
                isPrimary: paramSuggestion.isPrimary || false,
                orderIndex: paramSuggestion.orderIndex || 0,
              },
            })
          }
        }
      }

      return NextResponse.json({ success: true, word })
    } else if (suggestion.suggestionType === "EDIT_EXISTING" && suggestion.wordId) {
      // Update existing word
      const wordData = suggestion.suggestionData as any
      await prisma.word.update({
        where: { id: suggestion.wordId },
        data: {
          wordMaithili: wordData.wordMaithili || undefined,
          wordRomanized: wordData.wordRomanized || undefined,
          pronunciation: wordData.pronunciation || undefined,
        },
      })

      // Update parameters if provided
      if (suggestion.parameterSuggestions) {
        const paramSuggestions = suggestion.parameterSuggestions as any[]
        for (const paramSuggestion of paramSuggestions) {
          await prisma.wordParameter.updateMany({
            where: {
              wordId: suggestion.wordId,
              parameterKey: paramSuggestion.parameterKey,
            },
            data: {
              contentText: paramSuggestion.contentText || undefined,
            },
          })
        }
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error approving edit suggestion:", error)
    return NextResponse.json(
      { error: "Failed to approve edit suggestion" },
      { status: 500 }
    )
  }
}

