import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const dictionary = await prisma.dictionary.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            words: true,
          },
        },
      },
    })

    if (!dictionary) {
      return NextResponse.json(
        { error: "Dictionary not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(dictionary)
  } catch (error) {
    console.error("Error fetching dictionary:", error)
    return NextResponse.json(
      { error: "Failed to fetch dictionary" },
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

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, nameMaithili, targetLanguages, description, isActive } = body

    const dictionary = await prisma.dictionary.update({
      where: { id: params.id },
      data: {
        name,
        nameMaithili,
        targetLanguages,
        description,
        isActive,
      },
    })

    return NextResponse.json(dictionary)
  } catch (error) {
    console.error("Error updating dictionary:", error)
    return NextResponse.json(
      { error: "Failed to update dictionary" },
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
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      )
    }

    // Prevent deletion of main dictionary
    const dictionary = await prisma.dictionary.findUnique({
      where: { id: params.id },
    })

    if (dictionary?.isMain) {
      return NextResponse.json(
        { error: "Cannot delete main dictionary" },
        { status: 400 }
      )
    }

    await prisma.dictionary.update({
      where: { id: params.id },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({ message: "Dictionary deleted" })
  } catch (error) {
    console.error("Error deleting dictionary:", error)
    return NextResponse.json(
      { error: "Failed to delete dictionary" },
      { status: 500 }
    )
  }
}

