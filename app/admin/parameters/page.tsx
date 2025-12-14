"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Parameter {
  id: string
  parameterKey: string
  parameterName: string
  parameterNameMaithili: string | null
  parameterType: string
  isMultilingual: boolean
  supportedLanguages: string[] | null
  isRequired: boolean
  orderIndex: number
  isActive: boolean
  canEdit: string
  createdAt: string
  updatedAt: string
}

export default function AdminParametersPage() {
  const router = useRouter()
  const [parameters, setParameters] = useState<Parameter[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Parameter | null>(null)
  const [formData, setFormData] = useState({
    parameterKey: "",
    parameterName: "",
    parameterNameMaithili: "",
    parameterType: "TEXT",
    isMultilingual: false,
    supportedLanguages: [] as string[],
    isRequired: false,
    orderIndex: 0,
    canEdit: "ALL",
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
    fetchParameters()
  }, [])

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

  const fetchParameters = async () => {
    try {
      const response = await fetch("/api/parameters")
      if (response.ok) {
        const data = await response.json()
        // Fetch all parameters (including inactive) for admin
        const allResponse = await fetch("/api/parameters/all")
        if (allResponse.ok) {
          const allData = await allResponse.json()
          setParameters(allData)
        } else {
          setParameters(data)
        }
      }
    } catch (error) {
      console.error("Error fetching parameters:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      const url = editing
        ? `/api/parameters/${editing.id}`
        : "/api/parameters"
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to save parameter")
      }

      await fetchParameters()
      resetForm()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleEdit = (parameter: Parameter) => {
    setEditing(parameter)
    setFormData({
      parameterKey: parameter.parameterKey,
      parameterName: parameter.parameterName,
      parameterNameMaithili: parameter.parameterNameMaithili || "",
      parameterType: parameter.parameterType,
      isMultilingual: parameter.isMultilingual,
      supportedLanguages: parameter.supportedLanguages || [],
      isRequired: parameter.isRequired,
      orderIndex: parameter.orderIndex,
      canEdit: parameter.canEdit,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this parameter?")) {
      return
    }

    try {
      const response = await fetch(`/api/parameters/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete parameter")
      }

      await fetchParameters()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleToggleActive = async (parameter: Parameter) => {
    try {
      const response = await fetch(`/api/parameters/${parameter.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...parameter,
          isActive: !parameter.isActive,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update parameter")
      }

      await fetchParameters()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const resetForm = () => {
    setFormData({
      parameterKey: "",
      parameterName: "",
      parameterNameMaithili: "",
      parameterType: "TEXT",
      isMultilingual: false,
      supportedLanguages: [],
      isRequired: false,
      orderIndex: 0,
      canEdit: "ALL",
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
    } else if (name === "supportedLanguages") {
      // Handle languages as comma-separated string
      const languages = value.split(",").map((lang) => lang.trim()).filter(Boolean)
      setFormData((prev) => ({ ...prev, supportedLanguages: languages }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

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
          <h1 className="text-3xl font-bold">Manage Parameters</h1>
          <p className="mt-2 text-gray-600">
            Define and manage word parameters for dictionary entries
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add New Parameter"}
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editing ? "Edit Parameter" : "Create New Parameter"}</CardTitle>
            <CardDescription>
              {editing
                ? "Update parameter details"
                : "Add a new parameter definition for word entries"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parameter Key <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="parameterKey"
                    value={formData.parameterKey}
                    onChange={handleChange}
                    placeholder="meaning"
                    required
                    disabled={!!editing}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier (lowercase, no spaces)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parameter Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="parameterName"
                    value={formData.parameterName}
                    onChange={handleChange}
                    placeholder="Meaning"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parameter Name (Maithili)
                  </label>
                  <Input
                    name="parameterNameMaithili"
                    value={formData.parameterNameMaithili}
                    onChange={handleChange}
                    placeholder="अर्थ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Parameter Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="parameterType"
                    value={formData.parameterType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="TEXT">Text</option>
                    <option value="RICH_TEXT">Rich Text</option>
                    <option value="JSON">JSON</option>
                    <option value="ARRAY">Array</option>
                    <option value="MULTILINGUAL">Multilingual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Order Index <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="orderIndex"
                    type="number"
                    value={formData.orderIndex}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Edit Permission
                  </label>
                  <select
                    name="canEdit"
                    value={formData.canEdit}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="ALL">All Users</option>
                    <option value="ADMIN_ONLY">Admin Only</option>
                    <option value="SUPER_ADMIN_ONLY">Super Admin Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Supported Languages (comma-separated)
                  </label>
                  <Input
                    name="supportedLanguages"
                    value={formData.supportedLanguages.join(", ")}
                    onChange={handleChange}
                    placeholder="hindi, english, maithili"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isMultilingual"
                    checked={formData.isMultilingual}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm">Multilingual</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isRequired"
                    checked={formData.isRequired}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm">Required</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editing ? "Update Parameter" : "Create Parameter"}
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
          <CardTitle>Parameters ({parameters.length})</CardTitle>
          <CardDescription>
            All parameter definitions in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parameters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No parameters found. Create your first parameter above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Key</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Order</th>
                    <th className="text-left p-2">Required</th>
                    <th className="text-left p-2">Multilingual</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {parameters
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((parameter) => (
                      <tr
                        key={parameter.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2 font-mono text-sm">
                          {parameter.parameterKey}
                        </td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">
                              {parameter.parameterName}
                            </div>
                            {parameter.parameterNameMaithili && (
                              <div className="text-xs text-gray-500">
                                {parameter.parameterNameMaithili}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <span className="px-2 py-1 text-xs bg-gray-100 rounded">
                            {parameter.parameterType}
                          </span>
                        </td>
                        <td className="p-2">{parameter.orderIndex}</td>
                        <td className="p-2">
                          {parameter.isRequired ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="p-2">
                          {parameter.isMultilingual ? (
                            <span className="text-blue-600">Yes</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              parameter.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {parameter.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(parameter)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(parameter)}
                            >
                              {parameter.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(parameter.id)}
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

