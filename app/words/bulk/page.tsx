"use client"

import { useState, useEffect, useRef } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation } from "@/lib/translations"

interface Dictionary {
  id: string
  name: string
  nameMaithili: string | null
}

interface WordRow {
  wordMaithili: string
  wordRomanized: string
  pronunciation: string
  wordType: string
  meaningEnglish: string
  meaningHindi: string
}

export default function BulkWordEntryPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [selectedDictionary, setSelectedDictionary] = useState("")
  const [rows, setRows] = useState<WordRow[]>([
    {
      wordMaithili: "",
      wordRomanized: "",
      pronunciation: "",
      wordType: "",
      meaningEnglish: "",
      meaningHindi: "",
    },
  ])
  const [loading, setLoading] = useState(false)
  const tableRef = useRef<HTMLTableElement>(null)

  useEffect(() => {
    checkSession()
    fetchDictionaries()
  }, [])

  const checkSession = async () => {
    const session = await getSession()
    if (!session) {
      router.push("/login")
    }
  }

  const fetchDictionaries = async () => {
    try {
      const response = await fetch("/api/dictionaries")
      if (response.ok) {
        const data = await response.json()
        setDictionaries(data.filter((d: Dictionary) => d.isActive))
        if (data.length > 0) {
          const mainDict = data.find((d: Dictionary) => d.isMain)
          setSelectedDictionary(mainDict ? mainDict.id : data[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching dictionaries:", error)
    }
  }

  const addRow = () => {
    setRows([
      ...rows,
      {
        wordMaithili: "",
        wordRomanized: "",
        pronunciation: "",
        wordType: "",
        meaningEnglish: "",
        meaningHindi: "",
      },
    ])
  }

  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index))
    }
  }

  const updateRow = (index: number, field: keyof WordRow, value: string) => {
    const newRows = [...rows]
    newRows[index] = { ...newRows[index], [field]: value }
    setRows(newRows)
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    fieldIndex: number
  ) => {
    const fields: (keyof WordRow)[] = [
      "wordMaithili",
      "wordRomanized",
      "pronunciation",
      "wordType",
      "meaningEnglish",
      "meaningHindi",
    ]

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Move to next cell or add new row
      if (fieldIndex < fields.length - 1) {
        // Move to next field in same row
        const nextInput = tableRef.current?.querySelector(
          `input[data-row="${rowIndex}"][data-field="${fieldIndex + 1}"]`
        ) as HTMLInputElement
        nextInput?.focus()
      } else if (rowIndex < rows.length - 1) {
        // Move to first field of next row
        const nextInput = tableRef.current?.querySelector(
          `input[data-row="${rowIndex + 1}"][data-field="0"]`
        ) as HTMLInputElement
        nextInput?.focus()
      } else {
        // Add new row and focus on first field
        addRow()
        setTimeout(() => {
          const nextInput = tableRef.current?.querySelector(
            `input[data-row="${rows.length}"][data-field="0"]`
          ) as HTMLInputElement
          nextInput?.focus()
        }, 0)
      }
    } else if (e.key === "Tab" && fieldIndex === fields.length - 1 && rowIndex === rows.length - 1) {
      e.preventDefault()
      addRow()
      setTimeout(() => {
        const nextInput = tableRef.current?.querySelector(
          `input[data-row="${rows.length}"][data-field="0"]`
        ) as HTMLInputElement
        nextInput?.focus()
      }, 0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDictionary) {
      alert("कृपया एक शब्दकोश चुनें")
      return
    }

    // Filter out empty rows
    const validRows = rows.filter(
      (row) => row.wordMaithili.trim() !== "" && row.meaningEnglish.trim() !== ""
    )

    if (validRows.length === 0) {
      alert("कृपया कम से कम एक शब्द अर्थ के साथ दर्ज करें")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/words/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dictionaryId: selectedDictionary,
          words: validRows,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`${result.created} शब्द सफलतापूर्वक बनाए गए!`)
        // Reset form
        setRows([
          {
            wordMaithili: "",
            wordRomanized: "",
            pronunciation: "",
            wordType: "",
            meaningEnglish: "",
            meaningHindi: "",
          },
        ])
      } else {
        const error = await response.json()
        alert(error.error || "शब्द बनाने में विफल")
      }
    } catch (error) {
      console.error("Error creating words:", error)
      alert("शब्द बनाने में त्रुटि")
    } finally {
      setLoading(false)
    }
  }

  const handlePaste = (e: React.ClipboardEvent, startRow: number, startField: number) => {
    e.preventDefault()
    const paste = e.clipboardData.getData("text")
    const lines = paste.split("\n").filter((line) => line.trim() !== "")
    const fields: (keyof WordRow)[] = [
      "wordMaithili",
      "wordRomanized",
      "pronunciation",
      "wordType",
      "meaningEnglish",
      "meaningHindi",
    ]

    lines.forEach((line, lineIndex) => {
      const values = line.split("\t") // Tab-separated (Excel format)
      const rowIndex = startRow + lineIndex

      // Ensure we have enough rows
      while (rows.length <= rowIndex) {
        addRow()
      }

      values.forEach((value, valueIndex) => {
        const fieldIndex = startField + valueIndex
        if (fieldIndex < fields.length) {
          updateRow(rowIndex, fields[fieldIndex], value.trim())
        }
      })
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.bulkEntry.title}</h1>
            <p className="mt-2 text-gray-600">
              {t.bulkEntry.desc}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {t.bulkEntry.excelNote}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            {t.common.back} {t.dashboard.title}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t.bulkEntry.dictionarySelection}</CardTitle>
          <CardDescription>{t.bulkEntry.dictionarySelectionDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <select
            required
            value={selectedDictionary}
            onChange={(e) => setSelectedDictionary(e.target.value)}
            className="flex h-10 w-full max-w-md rounded-md border border-gray-300 bg-white px-3 py-2"
          >
            <option value="">{t.bulkEntry.selectDictionary}</option>
            {dictionaries.map((dict) => (
              <option key={dict.id} value={dict.id}>
                {dict.name} {dict.nameMaithili && `(${dict.nameMaithili})`}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.bulkEntry.wordEntries}</CardTitle>
                <CardDescription>
                  {t.bulkEntry.wordEntriesDesc}
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addRow}>
                {t.bulkEntry.addRow}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table ref={tableRef} className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="border p-2 text-left text-sm font-medium">{t.bulkEntry.wordMaithili}</th>
                    <th className="border p-2 text-left text-sm font-medium">{t.bulkEntry.wordRomanized}</th>
                    <th className="border p-2 text-left text-sm font-medium">{t.bulkEntry.pronunciation}</th>
                    <th className="border p-2 text-left text-sm font-medium">{t.words.type}</th>
                    <th className="border p-2 text-left text-sm font-medium">{t.bulkEntry.meaningEnglish}</th>
                    <th className="border p-2 text-left text-sm font-medium">{t.bulkEntry.meaningHindi}</th>
                    <th className="border p-2 text-left text-sm font-medium">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="border p-1">
                        <Input
                          data-row={rowIndex}
                          data-field={0}
                          value={row.wordMaithili}
                          onChange={(e) =>
                            updateRow(rowIndex, "wordMaithili", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 0)}
                          onPaste={(e) => handlePaste(e, rowIndex, 0)}
                          placeholder="नमस्कार"
                          className="border-0 focus:ring-0"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          data-row={rowIndex}
                          data-field={1}
                          value={row.wordRomanized}
                          onChange={(e) =>
                            updateRow(rowIndex, "wordRomanized", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 1)}
                          onPaste={(e) => handlePaste(e, rowIndex, 1)}
                          placeholder="namaskar"
                          className="border-0 focus:ring-0"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          data-row={rowIndex}
                          data-field={2}
                          value={row.pronunciation}
                          onChange={(e) =>
                            updateRow(rowIndex, "pronunciation", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 2)}
                          onPaste={(e) => handlePaste(e, rowIndex, 2)}
                          placeholder="/nəməskɑːr/"
                          className="border-0 focus:ring-0"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          data-row={rowIndex}
                          data-field={3}
                          value={row.wordType}
                          onChange={(e) =>
                            updateRow(rowIndex, "wordType", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 3)}
                          onPaste={(e) => handlePaste(e, rowIndex, 3)}
                          placeholder="noun"
                          className="border-0 focus:ring-0"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          data-row={rowIndex}
                          data-field={4}
                          value={row.meaningEnglish}
                          onChange={(e) =>
                            updateRow(rowIndex, "meaningEnglish", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 4)}
                          onPaste={(e) => handlePaste(e, rowIndex, 4)}
                          placeholder="Hello"
                          className="border-0 focus:ring-0"
                        />
                      </td>
                      <td className="border p-1">
                        <Input
                          data-row={rowIndex}
                          data-field={5}
                          value={row.meaningHindi}
                          onChange={(e) =>
                            updateRow(rowIndex, "meaningHindi", e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, 5)}
                          onPaste={(e) => handlePaste(e, rowIndex, 5)}
                          placeholder="नमस्कार"
                          className="border-0 focus:ring-0"
                        />
                      </td>
                      <td className="border p-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeRow(rowIndex)}
                          disabled={rows.length === 1}
                        >
                          {t.bulkEntry.remove}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex gap-4">
              <Button type="submit" disabled={loading || !selectedDictionary}>
                {loading ? t.bulkEntry.creating : `${t.bulkEntry.createWords} ${rows.filter(r => r.wordMaithili.trim() && r.meaningEnglish.trim()).length}`}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRows([
                    {
                      wordMaithili: "",
                      wordRomanized: "",
                      pronunciation: "",
                      wordType: "",
                      meaningEnglish: "",
                      meaningHindi: "",
                    },
                  ])
                }}
              >
                {t.bulkEntry.clearAll}
              </Button>
            </div>

            <div className="mt-4 rounded bg-blue-50 p-4 text-sm text-blue-800">
              <p className="font-medium">{t.bulkEntry.tips}</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>{t.bulkEntry.tip1}</li>
                <li>{t.bulkEntry.tip2}</li>
                <li>{t.bulkEntry.tip3}</li>
                <li>{t.bulkEntry.tip4}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

