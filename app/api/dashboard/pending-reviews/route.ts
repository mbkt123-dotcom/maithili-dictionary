import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userRole = (session.user as any)?.role || "PUBLIC"

    // Get words assigned to this user for review
    const workflows = await prisma.wordWorkflow.findMany({
      where: {
        assignedToId: userId,
        status: "PENDING",
      },
      include: {
        word: {
          include: {
            dictionary: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const words = workflows.map((wf) => ({
      ...wf.word,
      workflows: [{
        id: wf.id,
        currentStage: wf.currentStage,
        status: wf.status,
        comments: wf.comments,
      }],
    }))

    return NextResponse.json(words)
  } catch (error) {
    console.error("Error fetching pending reviews:", error)
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    )
  }
}

