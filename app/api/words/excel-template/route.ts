import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import XLSX from "xlsx"

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dictionaryId = searchParams.get("dictionaryId")

    // If dictionaryId is provided, use custom columns
    if (dictionaryId) {
      const columns = await prisma.dictionaryColumnDefinition.findMany({
        where: {
          dictionaryId,
          isActive: true,
        },
        orderBy: { columnOrder: "asc" },
      })

      if (columns.length > 0) {
        // Use custom columns
        const headers = columns.map((col) => col.columnName)
        const exampleRow = columns.map((col) => col.exampleValue || "")

        const worksheetData = [headers, exampleRow]

        // Add empty rows
        for (let i = 0; i < 3; i++) {
          worksheetData.push(columns.map(() => ""))
        }

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

        // Set column widths
        worksheet["!cols"] = columns.map(() => ({ wch: 20 }))

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Words")

        const excelBuffer = XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        })

        const dictionary = await prisma.dictionary.findUnique({
          where: { id: dictionaryId },
          select: { name: true },
        })

        const filename = dictionary
          ? `maithili-dictionary-${dictionary.name.replace(/\s+/g, "-").toLowerCase()}-template.xlsx`
          : "maithili-dictionary-template.xlsx"

        return new NextResponse(excelBuffer, {
          headers: {
            "Content-Type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        })
      }
    }

    // Default template if no dictionary or no custom columns
    // Create workbook
    const workbook = XLSX.utils.book_new()

    // Create worksheet data with headers and example rows
    const worksheetData = [
      // Headers
      [
        "Word (Maithili)",
        "Word (Romanized)",
        "Pronunciation",
        "Word Type",
        "Meaning (English)",
        "Meaning (Hindi)",
        "Example (English)",
        "Example (Hindi)",
        "Example (Maithili)",
        "Synonyms",
        "Antonyms",
        "Related Words",
      ],
      // Example row 1
      [
        "नमस्कार",
        "namaskar",
        "/nəməskɑːr/",
        "noun",
        "Greeting, Hello",
        "नमस्कार",
        "Namaskar is a common greeting in Maithili.",
        "नमस्कार मैथिली में एक सामान्य अभिवादन है।",
        "नमस्कार मैथिली मे एक सामान्य अभिवादन अछि।",
        "अभिवादन, प्रणाम",
        "",
        "स्वागत, बधाई",
      ],
      // Example row 2
      [
        "धन्यवाद",
        "dhanyavad",
        "/dʰənjəvɑːd/",
        "noun",
        "Thank you, Thanks",
        "धन्यवाद",
        "Dhanyavad for your help.",
        "आपकी मदद के लिए धन्यवाद।",
        "अहाँक मदद लेल धन्यवाद।",
        "आभार, कृतज्ञता",
        "",
        "सहायता, उपकार",
      ],
      // Empty rows for user to fill
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", "", "", "", "", ""],
    ]

    // Create worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)

    // Set column widths
    worksheet["!cols"] = [
      { wch: 20 }, // Word (Maithili)
      { wch: 18 }, // Word (Romanized)
      { wch: 18 }, // Pronunciation
      { wch: 12 }, // Word Type
      { wch: 25 }, // Meaning (English)
      { wch: 20 }, // Meaning (Hindi)
      { wch: 40 }, // Example (English)
      { wch: 40 }, // Example (Hindi)
      { wch: 40 }, // Example (Maithili)
      { wch: 20 }, // Synonyms
      { wch: 20 }, // Antonyms
      { wch: 20 }, // Related Words
    ]

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Words")

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    })

    // Return file as download
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="maithili-dictionary-template.xlsx"',
      },
    })
  } catch (error) {
    console.error("Error generating Excel template:", error)
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    )
  }
}

