import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"

export async function POST(
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

    const body = await request.json()
    const { action, comments, assignedToId, priority } = body

    const word = await prisma.word.findUnique({
      where: { id: params.id },
    })

    if (!word) {
      return NextResponse.json(
        { error: "Word not found" },
        { status: 404 }
      )
    }

    let workflow

    switch (action) {
      case "submit":
        // Create workflow entry
        workflow = await prisma.wordWorkflow.create({
          data: {
            wordId: params.id,
            currentStage: "EDITOR_REVIEW",
            assignedById: session.user.id,
            assignedToId: assignedToId || null,
            status: "PENDING",
            priority: priority || "MEDIUM",
            comments,
          },
        })

        // Update word status
        await prisma.word.update({
          where: { id: params.id },
          data: { status: "SUBMITTED" },
        })
        break

      case "approve":
        const currentWorkflow = await prisma.wordWorkflow.findFirst({
          where: { wordId: params.id },
          orderBy: { createdAt: "desc" },
        })

        if (currentWorkflow) {
          const userRole = (session.user as any)?.role

          let nextStage = currentWorkflow.currentStage
          if (userRole === "EDITOR" && currentWorkflow.currentStage === "EDITOR_REVIEW") {
            nextStage = "SENIOR_EDITOR_REVIEW"
          } else if (userRole === "SENIOR_EDITOR" && currentWorkflow.currentStage === "SENIOR_EDITOR_REVIEW") {
            nextStage = "EDITOR_IN_CHIEF_REVIEW"
          } else if (userRole === "EDITOR_IN_CHIEF" && currentWorkflow.currentStage === "EDITOR_IN_CHIEF_REVIEW") {
            nextStage = "APPROVED"
          }

          workflow = await prisma.wordWorkflow.update({
            where: { id: currentWorkflow.id },
            data: {
              currentStage: nextStage,
              status: nextStage === "APPROVED" ? "COMPLETED" : "IN_PROGRESS",
              completedAt: nextStage === "APPROVED" ? new Date() : null,
            },
          })

          await prisma.word.update({
            where: { id: params.id },
            data: {
              status: nextStage === "APPROVED" ? "APPROVED" : "UNDER_REVIEW",
              approvedAt: nextStage === "APPROVED" ? new Date() : null,
              approvedById: nextStage === "APPROVED" ? session.user.id : null,
            },
          })
        }
        break

      case "reject":
        await prisma.wordWorkflow.updateMany({
          where: { wordId: params.id },
          data: {
            status: "RETURNED",
            returnReason: comments,
          },
        })

        await prisma.word.update({
          where: { id: params.id },
          data: { status: "REJECTED" },
        })
        break

      case "return":
        await prisma.wordWorkflow.updateMany({
          where: { wordId: params.id },
          data: {
            status: "RETURNED",
            returnReason: comments,
            returnedToStage: "FIELD_RESEARCH",
          },
        })

        await prisma.word.update({
          where: { id: params.id },
          data: { status: "DRAFT" },
        })
        break
    }

    return NextResponse.json({ success: true, workflow })
  } catch (error) {
    console.error("Error processing workflow:", error)
    return NextResponse.json(
      { error: "Failed to process workflow" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflows = await prisma.wordWorkflow.findMany({
      where: { wordId: params.id },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        assignedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(workflows)
  } catch (error) {
    console.error("Error fetching workflow:", error)
    return NextResponse.json(
      { error: "Failed to fetch workflow" },
      { status: 500 }
    )
  }
}

