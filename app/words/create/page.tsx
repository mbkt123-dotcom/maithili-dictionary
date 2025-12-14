"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Dictionary {
  id: string
  name: string
  nameMaithili: string | null
}

interface ParameterDefinition {
  id: string
  parameterKey: string
  parameterName: string
  parameterType: string
  isMultilingual: boolean
  supportedLanguages: string[] | null
  isRequired: boolean
  orderIndex: number
}

export default function CreateWordPage() {
  const router = useRouter()
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [parameters, setParameters] = useState<ParameterDefinition[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dictionaryId: "",
    wordMaithili: "",
    wordRomanized: "",
    pronunciation: "",
    wordType: "",
  })
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({})

  useEffect(() => {
    fetchDictionaries()
    fetchParameters()
  }, [])

  const fetchDictionaries = async () => {
    try {
      const response = await fetch("/api/dictionaries")
      const data = await response.json()
      const activeDictionaries = data.filter((d: Dictionary) => d.isActive)
      setDictionaries(activeDictionaries)
      if (activeDictionaries.length > 0) {
        // Prefer main dictionary, otherwise first active
        const mainDict = activeDictionaries.find((d: Dictionary) => d.isMain)
        setFormData((prev) => ({
          ...prev,
          dictionaryId: mainDict ? mainDict.id : activeDictionaries[0].id,
        }))
      }
    } catch (error) {
      console.error("Error fetching dictionaries:", error)
    }
  }

  const fetchParameters = async () => {
    try {
      const response = await fetch("/api/parameters")
      const data = await response.json()
      setParameters(data.sort((a: ParameterDefinition, b: ParameterDefinition) => a.orderIndex - b.orderIndex))
    } catch (error) {
      console.error("Error fetching parameters:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleParameterChange = (paramKey: string, value: any, language?: string) => {
    setParameterValues((prev) => {
      const key = language ? `${paramKey}_${language}` : paramKey
      return { ...prev, [key]: value }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Build parameters array
      const params: any[] = []
      parameters.forEach((param) => {
        if (param.isMultilingual && param.supportedLanguages) {
          param.supportedLanguages.forEach((lang) => {
            const key = `${param.parameterKey}_${lang}`
            const value = parameterValues[key]
            if (value) {
              params.push({
                parameterKey: param.parameterKey,
                language: lang,
                contentText: value,
                isPrimary: lang === param.supportedLanguages[0],
                orderIndex: param.orderIndex,
              })
            }
          })
        } else {
          const value = parameterValues[param.parameterKey]
          if (value) {
            params.push({
              parameterKey: param.parameterKey,
              contentText: value,
              orderIndex: param.orderIndex,
            })
          }
        }
      })

      const response = await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          parameters: params,
        }),
      })

      if (response.ok) {
        const word = await response.json()
        router.push(`/words/${word.id}`)
      } else {
        alert("Failed to create word")
      }
    } catch (error) {
      console.error("Error creating word:", error)
      alert("Error creating word")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Word</h1>
        <p className="mt-2 text-gray-600">Add a new word to the dictionary</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the word details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Dictionary *
              </label>
              <select
                required
                value={formData.dictionaryId}
                onChange={(e) => handleInputChange("dictionaryId", e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
              >
                <option value="">Select dictionary</option>
                {dictionaries
                  .filter((dict) => dict.isActive)
                  .map((dict) => (
                    <option key={dict.id} value={dict.id}>
                      {dict.name} {dict.nameMaithili && `(${dict.nameMaithili})`}
                      {dict.isMain && " - Main"}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {dictionaries.length === 0 && "No dictionaries available. Admin can create dictionaries."}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Word (Maithili) *
              </label>
              <Input
                required
                value={formData.wordMaithili}
                onChange={(e) => handleInputChange("wordMaithili", e.target.value)}
                placeholder="Enter word in Maithili"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Word (Romanized)
              </label>
              <Input
                value={formData.wordRomanized}
                onChange={(e) => handleInputChange("wordRomanized", e.target.value)}
                placeholder="Enter romanized form"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Pronunciation (IPA)
              </label>
              <Input
                value={formData.pronunciation}
                onChange={(e) => handleInputChange("pronunciation", e.target.value)}
                placeholder="e.g., /ˈwɜːrd/"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Word Type</label>
              <Input
                value={formData.wordType}
                onChange={(e) => handleInputChange("wordType", e.target.value)}
                placeholder="e.g., noun, verb, adjective"
              />
            </div>
          </CardContent>
        </Card>

        {parameters.map((param) => (
          <Card key={param.id} className="mb-6">
            <CardHeader>
              <CardTitle>
                {param.parameterName}
                {param.isRequired && <span className="text-red-500"> *</span>}
              </CardTitle>
              <CardDescription>{param.parameterType}</CardDescription>
            </CardHeader>
            <CardContent>
              {param.isMultilingual && param.supportedLanguages ? (
                <div className="space-y-4">
                  {param.supportedLanguages.map((lang) => (
                    <div key={lang}>
                      <label className="mb-2 block text-sm font-medium capitalize">
                        {param.parameterName} ({lang})
                      </label>
                      <Input
                        required={param.isRequired}
                        value={parameterValues[`${param.parameterKey}_${lang}`] || ""}
                        onChange={(e) =>
                          handleParameterChange(param.parameterKey, e.target.value, lang)
                        }
                        placeholder={`Enter ${param.parameterName.toLowerCase()} in ${lang}`}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <Input
                  required={param.isRequired}
                  value={parameterValues[param.parameterKey] || ""}
                  onChange={(e) => handleParameterChange(param.parameterKey, e.target.value)}
                  placeholder={`Enter ${param.parameterName.toLowerCase()}`}
                />
              )}
            </CardContent>
          </Card>
        ))}

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Word"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

