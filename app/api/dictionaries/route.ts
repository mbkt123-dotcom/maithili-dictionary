import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = session?.user ? (session.user as any)?.role : null
    
    // Admin users can see all dictionaries, others only active
    const where = (userRole === "ADMIN" || userRole === "SUPER_ADMIN")
      ? {}
      : { isActive: true }

    const dictionaries = await prisma.dictionary.findMany({
      where,
      include: {
        _count: {
          select: {
            words: true,
          },
        },
      },
      orderBy: {
        isMain: "desc",
      },
    })

    return NextResponse.json(dictionaries)
  } catch (error) {
    console.error("Error fetching dictionaries:", error)
    return NextResponse.json(
      { error: "Failed to fetch dictionaries" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { name, nameMaithili, sourceLanguage, targetLanguages, description, isMain, isActive } = body

    const dictionary = await prisma.dictionary.create({
      data: {
        name,
        nameMaithili,
        sourceLanguage: sourceLanguage || "maithili",
        targetLanguages: targetLanguages || ["hindi", "english"],
        description,
        isMain: isMain || false,
        isActive: isActive !== undefined ? isActive : true,
      },
    })

    return NextResponse.json(dictionary, { status: 201 })
  } catch (error) {
    console.error("Error creating dictionary:", error)
    return NextResponse.json(
      { error: "Failed to create dictionary" },
      { status: 500 }
    )
  }
}

