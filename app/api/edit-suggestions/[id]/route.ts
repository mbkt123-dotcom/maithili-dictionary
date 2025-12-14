import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const suggestion = await prisma.editSuggestion.findUnique({
      where: { id: params.id },
      include: {
        word: true,
        dictionary: true,
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error("Error fetching edit suggestion:", error)
    return NextResponse.json(
      { error: "Failed to fetch edit suggestion" },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const { status, reviewNotes } = body

    const suggestion = await prisma.editSuggestion.update({
      where: { id: params.id },
      data: {
        status,
        reviewNotes,
        reviewedById: session.user.id,
        reviewedAt: new Date(),
      },
    })

    return NextResponse.json(suggestion)
  } catch (error) {
    console.error("Error updating edit suggestion:", error)
    return NextResponse.json(
      { error: "Failed to update edit suggestion" },
      { status: 500 }
    )
  }
}

