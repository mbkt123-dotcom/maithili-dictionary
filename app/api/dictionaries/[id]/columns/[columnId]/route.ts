import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; columnId: string } }
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
      columnName,
      columnNameMaithili,
      fieldMapping,
      columnOrder,
      isRequired,
      dataType,
      defaultValue,
      validationRule,
      helpText,
      exampleValue,
      isActive,
    } = body

    const column = await prisma.dictionaryColumnDefinition.update({
      where: { id: params.columnId },
      data: {
        columnName,
        columnNameMaithili: columnNameMaithili || null,
        fieldMapping,
        columnOrder,
        isRequired: isRequired || false,
        dataType: dataType || "text",
        defaultValue: defaultValue || null,
        validationRule: validationRule || null,
        helpText: helpText || null,
        exampleValue: exampleValue || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(column)
  } catch (error: any) {
    console.error("Error updating column:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Column not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; columnId: string } }
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

    await prisma.dictionaryColumnDefinition.delete({
      where: { id: params.columnId },
    })

    return NextResponse.json({ message: "Column deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting column:", error)
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Column not found" },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    )
  }
}

