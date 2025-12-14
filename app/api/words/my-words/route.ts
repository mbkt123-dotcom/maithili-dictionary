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

    const words = await prisma.word.findMany({
      where: {
        createdById: session.user.id,
      },
      include: {
        dictionary: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(words)
  } catch (error) {
    console.error("Error fetching my words:", error)
    return NextResponse.json(
      { error: "Failed to fetch words" },
      { status: 500 }
    )
  }
}

