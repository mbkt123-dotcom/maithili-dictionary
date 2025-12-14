"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Dictionary {
  id: string
  name: string
  nameMaithili: string | null
  sourceLanguage: string
  targetLanguages: string[]
  isMain: boolean
  isActive: boolean
  description: string | null
}

export default function AdminDictionariesPage() {
  const router = useRouter()
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Dictionary | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    nameMaithili: "",
    sourceLanguage: "maithili",
    targetLanguages: ["hindi", "english"],
    isMain: false,
    isActive: true,
    description: "",
  })

  useEffect(() => {
    checkSession()
    fetchDictionaries()
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

  const fetchDictionaries = async () => {
    try {
      const response = await fetch("/api/dictionaries")
      if (response.ok) {
        const data = await response.json()
        setDictionaries(data)
      }
    } catch (error) {
      console.error("Error fetching dictionaries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editing
        ? `/api/dictionaries/${editing.id}`
        : "/api/dictionaries"
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchDictionaries()
        setShowForm(false)
        setEditing(null)
        setFormData({
          name: "",
          nameMaithili: "",
          sourceLanguage: "maithili",
          targetLanguages: ["hindi", "english"],
          isMain: false,
          isActive: true,
          description: "",
        })
      }
    } catch (error) {
      console.error("Error saving dictionary:", error)
    }
  }

  const handleEdit = (dict: Dictionary) => {
    setEditing(dict)
    setFormData({
      name: dict.name,
      nameMaithili: dict.nameMaithili || "",
      sourceLanguage: dict.sourceLanguage,
      targetLanguages: Array.isArray(dict.targetLanguages)
        ? dict.targetLanguages
        : ["hindi", "english"],
      isMain: dict.isMain,
      isActive: dict.isActive,
      description: dict.description || "",
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dictionary?")) return

    try {
      const response = await fetch(`/api/dictionaries/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        fetchDictionaries()
      }
    } catch (error) {
      console.error("Error deleting dictionary:", error)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Dictionaries</h1>
        <Button onClick={() => {
          setShowForm(true)
          setEditing(null)
          setFormData({
            name: "",
            nameMaithili: "",
            sourceLanguage: "maithili",
            targetLanguages: ["hindi", "english"],
            isMain: false,
            isActive: true,
            description: "",
          })
        }}>
          Add New Dictionary
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editing ? "Edit Dictionary" : "Create New Dictionary"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Name (English) *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dictionary Name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Name (Maithili)</label>
                <Input
                  value={formData.nameMaithili}
                  onChange={(e) => setFormData({ ...formData, nameMaithili: e.target.value })}
                  placeholder="शब्दकोश नाम"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Source Language *</label>
                <Input
                  required
                  value={formData.sourceLanguage}
                  onChange={(e) => setFormData({ ...formData, sourceLanguage: e.target.value })}
                  placeholder="maithili"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Target Languages (comma-separated) *</label>
                <Input
                  required
                  value={formData.targetLanguages.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetLanguages: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                  placeholder="hindi, english"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isMain}
                    onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                  />
                  <span>Is Main Dictionary (MLRC)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Is Active</span>
                </label>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  placeholder="Dictionary description..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">{editing ? "Update" : "Create"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditing(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dictionaries.map((dict) => (
          <Card key={dict.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{dict.name}</CardTitle>
                  {dict.nameMaithili && (
                    <CardDescription>{dict.nameMaithili}</CardDescription>
                  )}
                </div>
                {dict.isMain && (
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                    Main
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 space-y-2 text-sm">
                <div>
                  <span className="font-medium">Source:</span> {dict.sourceLanguage}
                </div>
                <div>
                  <span className="font-medium">Targets:</span>{" "}
                  {Array.isArray(dict.targetLanguages)
                    ? dict.targetLanguages.join(", ")
                    : "N/A"}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {dict.isActive ? (
                    <span className="text-green-600">Active</span>
                  ) : (
                    <span className="text-gray-500">Inactive</span>
                  )}
                </div>
                {dict.description && (
                  <div className="text-gray-600">{dict.description}</div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(dict)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/admin/dictionaries/${dict.id}/columns`)}
                >
                  Manage Columns
                </Button>
                {!dict.isMain && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(dict.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

