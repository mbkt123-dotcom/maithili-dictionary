import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { prisma } from "@/lib/db/prisma"
import XLSX from "xlsx"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const dictionaryId = formData.get("dictionaryId") as string

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    if (!dictionaryId) {
      return NextResponse.json(
        { error: "Dictionary ID is required" },
        { status: 400 }
      )
    }

    // Verify dictionary exists
    const dictionary = await prisma.dictionary.findUnique({
      where: { id: dictionaryId },
    })

    if (!dictionary) {
      return NextResponse.json(
        { error: "Dictionary not found" },
        { status: 404 }
      )
    }

    // Read Excel file
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

    if (data.length === 0) {
      return NextResponse.json(
        { error: "No data found in Excel file" },
        { status: 400 }
      )
    }

    // Get dictionary column definitions
    const columnDefinitions = await prisma.dictionaryColumnDefinition.findMany({
      where: {
        dictionaryId,
        isActive: true,
      },
      orderBy: { columnOrder: "asc" },
    })

    // Get parameter definitions
    const parameterDefinitions = await prisma.parameterDefinition.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
    })

    const meaningParam = parameterDefinitions.find(
      (p) => p.parameterKey === "meaning"
    )
    const exampleParam = parameterDefinitions.find(
      (p) => p.parameterKey === "example"
    )

    // Skip header row
    const rows = data.slice(1).filter((row) => row && row.length > 0)

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No data rows found in Excel file" },
        { status: 400 }
      )
    }

    const createdWords: string[] = []
    const errors: string[] = []

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNumber = i + 2 // +2 because we skipped header and arrays are 0-indexed

      try {
        // Map row data based on column definitions
        const rowData: Record<string, string> = {}
        
        if (columnDefinitions.length > 0) {
          // Use dictionary-specific column mapping
          columnDefinitions.forEach((colDef, index) => {
            const value = row[index]?.toString().trim() || ""
            rowData[colDef.fieldMapping] = value
          })
        } else {
          // Fallback to default mapping if no custom columns defined
          rowData["wordMaithili"] = row[0]?.toString().trim() || ""
          rowData["wordRomanized"] = row[1]?.toString().trim() || ""
          rowData["pronunciation"] = row[2]?.toString().trim() || ""
          rowData["wordType"] = row[3]?.toString().trim() || ""
          rowData["meaning.english"] = row[4]?.toString().trim() || ""
          rowData["meaning.hindi"] = row[5]?.toString().trim() || ""
          rowData["example.english"] = row[6]?.toString().trim() || ""
          rowData["example.hindi"] = row[7]?.toString().trim() || ""
          rowData["example.maithili"] = row[8]?.toString().trim() || ""
        }

        // Extract data from mapped row
        const wordMaithili = rowData["wordMaithili"] || ""
        const wordRomanized = rowData["wordRomanized"] || ""
        const pronunciation = rowData["pronunciation"] || ""
        const wordType = rowData["wordType"] || ""
        const meaningEnglish = rowData["meaning.english"] || ""
        const meaningHindi = rowData["meaning.hindi"] || ""
        const meaningMaithili = rowData["meaning.maithili"] || ""
        const exampleEnglish = rowData["example.english"] || ""
        const exampleHindi = rowData["example.hindi"] || ""
        const exampleMaithili = rowData["example.maithili"] || ""
        const synonyms = rowData["synonyms"] || ""
        const antonyms = rowData["antonyms"] || ""
        const relatedWords = rowData["relatedWords"] || ""

        // Validate required fields based on column definitions
        const requiredFields: string[] = []
        if (columnDefinitions.length > 0) {
          columnDefinitions
            .filter((col) => col.isRequired)
            .forEach((col) => {
              const value = rowData[col.fieldMapping] || ""
              if (!value) {
                requiredFields.push(col.columnName)
              }
            })
        } else {
          // Default required fields
          if (!wordMaithili) requiredFields.push("Word (Maithili)")
          if (!meaningEnglish) requiredFields.push("Meaning (English)")
        }

        if (requiredFields.length > 0) {
          errors.push(
            `Row ${rowNumber}: Missing required fields: ${requiredFields.join(", ")}`
          )
          continue
        }

        // Check if word already exists
        const existingWord = await prisma.word.findFirst({
          where: {
            dictionaryId,
            wordMaithili,
          },
        })

        if (existingWord) {
          errors.push(
            `Row ${rowNumber}: Word "${wordMaithili}" already exists in this dictionary`
          )
          continue
        }

        // Create word
        const word = await prisma.word.create({
          data: {
            dictionaryId,
            wordMaithili,
            wordRomanized: wordRomanized || null,
            pronunciation: pronunciation || null,
            wordType: wordType || null,
            createdById: session.user.id,
            status: "DRAFT",
          },
        })

        // Create parameters
        const parametersToCreate: any[] = []

        // Meaning parameter
        if (meaningParam) {
          if (meaningEnglish) {
            parametersToCreate.push({
              wordId: word.id,
              parameterDefinitionId: meaningParam.id,
              parameterKey: "meaning",
              language: "english",
              contentText: meaningEnglish,
              isPrimary: true,
              orderIndex: 0,
            })
          }
          if (meaningHindi) {
            parametersToCreate.push({
              wordId: word.id,
              parameterDefinitionId: meaningParam.id,
              parameterKey: "meaning",
              language: "hindi",
              contentText: meaningHindi,
              isPrimary: false,
              orderIndex: 1,
            })
          }
        }

        // Example parameter
        if (exampleParam) {
          if (exampleEnglish) {
            parametersToCreate.push({
              wordId: word.id,
              parameterDefinitionId: exampleParam.id,
              parameterKey: "example",
              language: "english",
              contentText: exampleEnglish,
              isPrimary: false,
              orderIndex: 2,
            })
          }
          if (exampleHindi) {
            parametersToCreate.push({
              wordId: word.id,
              parameterDefinitionId: exampleParam.id,
              parameterKey: "example",
              language: "hindi",
              contentText: exampleHindi,
              isPrimary: false,
              orderIndex: 3,
            })
          }
          if (exampleMaithili) {
            parametersToCreate.push({
              wordId: word.id,
              parameterDefinitionId: exampleParam.id,
              parameterKey: "example",
              language: "maithili",
              contentText: exampleMaithili,
              isPrimary: false,
              orderIndex: 4,
            })
          }
        }

        // Create all parameters
        if (parametersToCreate.length > 0) {
          await prisma.wordParameter.createMany({
            data: parametersToCreate,
          })
        }

        // Handle relationships (synonyms, antonyms, related words)
        // Note: These will be created after all words are processed
        // For now, we'll just create the word

        createdWords.push(word.id)
      } catch (error: any) {
        errors.push(`Row ${rowNumber}: ${error.message || "Unknown error"}`)
      }
    }

    return NextResponse.json({
      success: true,
      created: createdWords.length,
      errors: errors.length,
      createdWords,
      errorDetails: errors,
    })
  } catch (error: any) {
    console.error("Error processing Excel upload:", error)
    return NextResponse.json(
      { error: error.message || "Failed to process Excel file" },
      { status: 500 }
    )
  }
}

