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
    const isEditor = ["EDITOR", "SENIOR_EDITOR", "EDITOR_IN_CHIEF"].includes(userRole)

    // Execute all queries in parallel for better performance
    const [myWords, pendingReviews, assignments] = await Promise.all([
      prisma.word.count({
        where: {
          createdById: userId,
        },
      }),
      isEditor
        ? prisma.wordWorkflow.count({
            where: {
              assignedToId: userId,
              status: "PENDING",
            },
          })
        : Promise.resolve(0),
      prisma.workAssignment.count({
        where: {
          assignedToId: userId,
          status: "PENDING",
        },
      }),
    ])

    return NextResponse.json({
      myWords,
      pendingReviews,
      assignments,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    )
  }
}

