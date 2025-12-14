import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parameter = await prisma.parameterDefinition.findUnique({
      where: { id: params.id },
    })

    if (!parameter) {
      return NextResponse.json(
        { error: "Parameter not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(parameter)
  } catch (error) {
    console.error("Error fetching parameter:", error)
    return NextResponse.json(
      { error: "Failed to fetch parameter" },
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
      isActive,
      canEdit,
    } = body

    const parameter = await prisma.parameterDefinition.update({
      where: { id: params.id },
      data: {
        parameterKey,
        parameterName,
        parameterNameMaithili: parameterNameMaithili || null,
        parameterType,
        isMultilingual: isMultilingual || false,
        supportedLanguages: supportedLanguages || [],
        isRequired: isRequired || false,
        orderIndex: orderIndex || 0,
        isActive: isActive !== undefined ? isActive : true,
        canEdit: canEdit || "ALL",
      },
    })

    return NextResponse.json(parameter)
  } catch (error: any) {
    console.error("Error updating parameter:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Parameter not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update parameter" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.parameterDefinition.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Parameter deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting parameter:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Parameter not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete parameter" },
      { status: 500 }
    )
  }
}

