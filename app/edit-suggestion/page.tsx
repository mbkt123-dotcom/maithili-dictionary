"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Dictionary {
  id: string
  name: string
  isMain: boolean
}

interface Word {
  id: string
  wordMaithili: string
  wordRomanized: string | null
}

export default function EditSuggestionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wordId = searchParams.get("wordId")

  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [word, setWord] = useState<Word | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    dictionaryId: "",
    suggestionType: wordId ? "EDIT_EXISTING" : "ADD_NEW_WORD",
    email: "",
    phone: "",
    name: "",
    wordMaithili: "",
    wordRomanized: "",
    pronunciation: "",
    wordType: "",
    meaning: "",
  })

  useEffect(() => {
    fetchDictionaries()
    if (wordId) {
      fetchWord()
    }
  }, [wordId])

  const fetchDictionaries = async () => {
    try {
      const response = await fetch("/api/dictionaries")
      const data = await response.json()
      const mainDict = data.find((d: Dictionary) => d.isMain)
      if (mainDict) {
        setFormData((prev) => ({ ...prev, dictionaryId: mainDict.id }))
      }
      setDictionaries(data.filter((d: Dictionary) => d.isMain))
    } catch (error) {
      console.error("Error fetching dictionaries:", error)
    }
  }

  const fetchWord = async () => {
    try {
      const response = await fetch(`/api/words/${wordId}`)
      if (response.ok) {
        const data = await response.json()
        setWord(data)
        setFormData((prev) => ({
          ...prev,
          wordMaithili: data.wordMaithili,
          wordRomanized: data.wordRomanized || "",
          pronunciation: data.pronunciation || "",
          wordType: data.wordType || "",
        }))
      }
    } catch (error) {
      console.error("Error fetching word:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const suggestionData = {
        wordMaithili: formData.wordMaithili,
        wordRomanized: formData.wordRomanized,
        pronunciation: formData.pronunciation,
        wordType: formData.wordType,
      }

      const parameterSuggestions = formData.meaning
        ? [
            {
              parameterKey: "meaning",
              contentText: formData.meaning,
              language: "english",
              isPrimary: true,
              orderIndex: 0,
            },
          ]
        : null

      const response = await fetch("/api/edit-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordId: wordId || null,
          dictionaryId: formData.dictionaryId,
          suggestionType: formData.suggestionType,
          email: formData.email,
          phone: formData.phone,
          name: formData.name,
          suggestionData,
          parameterSuggestions,
        }),
      })

      if (response.ok) {
        router.push(`/edit-suggestion/thank-you`)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to submit suggestion")
      }
    } catch (error) {
      console.error("Error submitting suggestion:", error)
      alert("Error submitting suggestion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {wordId ? "Suggest Edit" : "Suggest New Word"}
        </h1>
        <p className="mt-2 text-gray-600">
          Help improve the dictionary by suggesting edits or new words
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              We&apos;ll contact you about your suggestion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email *
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone *
              </label>
              <Input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your name (optional)"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Word Information</CardTitle>
            <CardDescription>
              {wordId
                ? "Suggest changes to this word"
                : "Enter details for the new word"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wordId && (
              <div className="rounded bg-blue-50 p-4 text-sm text-blue-800">
                Editing word: <strong>{word?.wordMaithili}</strong>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium">
                Word (Maithili) *
              </label>
              <Input
                required
                value={formData.wordMaithili}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    wordMaithili: e.target.value,
                  }))
                }
                placeholder="Enter word in Maithili"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Word (Romanized)
              </label>
              <Input
                value={formData.wordRomanized}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    wordRomanized: e.target.value,
                  }))
                }
                placeholder="Enter romanized form"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Pronunciation (IPA)
              </label>
              <Input
                value={formData.pronunciation}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pronunciation: e.target.value,
                  }))
                }
                placeholder="e.g., /ˈwɜːrd/"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Word Type</label>
              <Input
                value={formData.wordType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    wordType: e.target.value,
                  }))
                }
                placeholder="e.g., noun, verb, adjective"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Meaning</label>
              <Input
                value={formData.meaning}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meaning: e.target.value,
                  }))
                }
                placeholder="Enter the meaning"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Suggestion"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

