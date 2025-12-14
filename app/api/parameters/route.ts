import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const parameters = await prisma.parameterDefinition.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        orderIndex: "asc",
      },
    })

    return NextResponse.json(parameters)
  } catch (error) {
    console.error("Error fetching parameters:", error)
    return NextResponse.json(
      { error: "Failed to fetch parameters" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const {
      parameterKey,
      parameterName,
      parameterNameMaithili,
      parameterType,
      isMultilingual,
      supportedLanguages,
      isRequired,
      orderIndex,
      canEdit,
    } = body

    const parameter = await prisma.parameterDefinition.create({
      data: {
        parameterKey,
        parameterName,
        parameterNameMaithili: parameterNameMaithili || null,
        parameterType,
        isMultilingual: isMultilingual || false,
        supportedLanguages: supportedLanguages || [],
        isRequired: isRequired || false,
        orderIndex: orderIndex || 0,
        canEdit: canEdit || "ALL",
      },
    })

    return NextResponse.json(parameter, { status: 201 })
  } catch (error: any) {
    console.error("Error creating parameter:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Parameter key already exists" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create parameter" },
      { status: 500 }
    )
  }
}

