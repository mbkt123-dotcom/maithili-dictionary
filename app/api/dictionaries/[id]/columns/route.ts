import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(
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

    const columns = await prisma.dictionaryColumnDefinition.findMany({
      where: { dictionaryId: params.id },
      orderBy: { columnOrder: "asc" },
    })

    return NextResponse.json(columns)
  } catch (error) {
    console.error("Error fetching columns:", error)
    return NextResponse.json(
      { error: "Failed to fetch columns" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    // Verify dictionary exists
    const dictionary = await prisma.dictionary.findUnique({
      where: { id: params.id },
    })

    if (!dictionary) {
      return NextResponse.json(
        { error: "Dictionary not found" },
        { status: 404 }
      )
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
    } = body

    const column = await prisma.dictionaryColumnDefinition.create({
      data: {
        dictionaryId: params.id,
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
        isActive: true,
      },
    })

    return NextResponse.json(column, { status: 201 })
  } catch (error: any) {
    console.error("Error creating column:", error)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Column order already exists for this dictionary" },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: "Failed to create column" },
      { status: 500 }
    )
  }
}

