import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Fetch all parameters (including inactive) for admin
    const parameters = await prisma.parameterDefinition.findMany({
      orderBy: {
        orderIndex: "asc",
      },
    })

    return NextResponse.json(parameters)
  } catch (error) {
    console.error("Error fetching all parameters:", error)
    return NextResponse.json(
      { error: "Failed to fetch parameters" },
      { status: 500 }
    )
  }
}

