"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Column {
  id: string
  columnName: string
  columnNameMaithili: string | null
  fieldMapping: string
  columnOrder: number
  isRequired: boolean
  isActive: boolean
  dataType: string
  defaultValue: string | null
  validationRule: string | null
  helpText: string | null
  exampleValue: string | null
}

interface Dictionary {
  id: string
  name: string
  nameMaithili: string | null
}

export default function DictionaryColumnsPage() {
  const params = useParams()
  const router = useRouter()
  const dictionaryId = params.id as string

  const [dictionary, setDictionary] = useState<Dictionary | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Column | null>(null)
  const [formData, setFormData] = useState({
    columnName: "",
    columnNameMaithili: "",
    fieldMapping: "",
    columnOrder: 0,
    isRequired: false,
    dataType: "text",
    defaultValue: "",
    helpText: "",
    exampleValue: "",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
    fetchDictionary()
    fetchColumns()
  }, [dictionaryId])

  const checkSession = async () => {
    const session = await getSession()
    if (!session) {
      router.push("/login")
    } else {
      const role = (session.user as any)?.role
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
        router.push("/dashboard")
      }
    }
  }

  const fetchDictionary = async () => {
    try {
      const response = await fetch(`/api/dictionaries/${dictionaryId}`)
      if (response.ok) {
        const data = await response.json()
        setDictionary(data)
      }
    } catch (error) {
      console.error("Error fetching dictionary:", error)
    }
  }

  const fetchColumns = async () => {
    try {
      const response = await fetch(`/api/dictionaries/${dictionaryId}/columns`)
      if (response.ok) {
        const data = await response.json()
        setColumns(data)
      }
    } catch (error) {
      console.error("Error fetching columns:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const url = editing
        ? `/api/dictionaries/${dictionaryId}/columns/${editing.id}`
        : `/api/dictionaries/${dictionaryId}/columns`
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save column")
      }

      await fetchColumns()
      resetForm()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEdit = (column: Column) => {
    setEditing(column)
    setFormData({
      columnName: column.columnName,
      columnNameMaithili: column.columnNameMaithili || "",
      fieldMapping: column.fieldMapping,
      columnOrder: column.columnOrder,
      isRequired: column.isRequired,
      dataType: column.dataType,
      defaultValue: column.defaultValue || "",
      helpText: column.helpText || "",
      exampleValue: column.exampleValue || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this column?")) return

    try {
      const response = await fetch(
        `/api/dictionaries/${dictionaryId}/columns/${id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        throw new Error("Failed to delete column")
      }

      await fetchColumns()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleToggleActive = async (column: Column) => {
    try {
      const response = await fetch(
        `/api/dictionaries/${dictionaryId}/columns/${column.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...column,
            isActive: !column.isActive,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to update column")
      }

      await fetchColumns()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      columnName: "",
      columnNameMaithili: "",
      fieldMapping: "",
      columnOrder: columns.length > 0 ? Math.max(...columns.map(c => c.columnOrder)) + 1 : 0,
      isRequired: false,
      dataType: "text",
      defaultValue: "",
      helpText: "",
      exampleValue: "",
    })
    setEditing(null)
    setShowForm(false)
    setError(null)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  // Common field mappings
  const fieldMappings = [
    { value: "wordMaithili", label: "Word (Maithili)" },
    { value: "wordRomanized", label: "Word (Romanized)" },
    { value: "pronunciation", label: "Pronunciation" },
    { value: "wordType", label: "Word Type" },
    { value: "meaning.english", label: "Meaning (English)" },
    { value: "meaning.hindi", label: "Meaning (Hindi)" },
    { value: "meaning.maithili", label: "Meaning (Maithili)" },
    { value: "example.english", label: "Example (English)" },
    { value: "example.hindi", label: "Example (Hindi)" },
    { value: "example.maithili", label: "Example (Maithili)" },
    { value: "synonyms", label: "Synonyms" },
    { value: "antonyms", label: "Antonyms" },
    { value: "relatedWords", label: "Related Words" },
  ]

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Columns</h1>
          <p className="mt-2 text-gray-600">
            Define Excel template columns for{" "}
            <strong>{dictionary?.name}</strong>
            {dictionary?.nameMaithili && ` (${dictionary.nameMaithili})`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/dictionaries")}>
            ← Back to Dictionaries
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Add New Column"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {editing ? "Edit Column" : "Create New Column"}
            </CardTitle>
            <CardDescription>
              {editing
                ? "Update column definition"
                : "Add a new column to the Excel template"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Column Name (English) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="columnName"
                    value={formData.columnName}
                    onChange={handleChange}
                    placeholder="Word (Maithili)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Column Name (Maithili)
                  </label>
                  <Input
                    name="columnNameMaithili"
                    value={formData.columnNameMaithili}
                    onChange={handleChange}
                    placeholder="शब्द (मैथिली)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Field Mapping <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="fieldMapping"
                    value={formData.fieldMapping}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Field Mapping</option>
                    {fieldMappings.map((mapping) => (
                      <option key={mapping.value} value={mapping.value}>
                        {mapping.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Maps to Word or WordParameter field
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Column Order <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="columnOrder"
                    type="number"
                    value={formData.columnOrder}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Determines column position in Excel (0 = first column)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Data Type
                  </label>
                  <select
                    name="dataType"
                    value={formData.dataType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="boolean">Boolean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Default Value
                  </label>
                  <Input
                    name="defaultValue"
                    value={formData.defaultValue}
                    onChange={handleChange}
                    placeholder="Optional default value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Help Text
                  </label>
                  <Input
                    name="helpText"
                    value={formData.helpText}
                    onChange={handleChange}
                    placeholder="Instructions for users"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Example Value
                  </label>
                  <Input
                    name="exampleValue"
                    value={formData.exampleValue}
                    onChange={handleChange}
                    placeholder="Example data for template"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm">Required Field</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editing ? "Update Column" : "Create Column"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Columns ({columns.length})</CardTitle>
          <CardDescription>
            Column definitions for Excel template generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {columns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No columns defined. Create your first column above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Order</th>
                    <th className="text-left p-2">Column Name</th>
                    <th className="text-left p-2">Field Mapping</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Required</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {columns
                    .sort((a, b) => a.columnOrder - b.columnOrder)
                    .map((column) => (
                      <tr key={column.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{column.columnOrder}</td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{column.columnName}</div>
                            {column.columnNameMaithili && (
                              <div className="text-xs text-gray-500">
                                {column.columnNameMaithili}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded font-mono">
                            {column.fieldMapping}
                          </span>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 text-xs bg-blue-100 rounded">
                            {column.dataType}
                          </span>
                        </td>
                        <td className="p-2">
                          {column.isRequired ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              column.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {column.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(column)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(column)}
                            >
                              {column.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(column.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

