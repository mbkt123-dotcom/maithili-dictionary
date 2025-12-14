"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface EditSuggestion {
  id: string
  suggestionType: string
  email: string
  phone: string
  name: string | null
  status: string
  suggestionData: any
  word: {
    id: string
    wordMaithili: string
  } | null
  dictionary: {
    name: string
  }
  createdAt: string
}

export default function AdminEditSuggestionsPage() {
  const router = useRouter()
  const [suggestions, setSuggestions] = useState<EditSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("PENDING")

  useEffect(() => {
    checkSession()
    fetchSuggestions()
  }, [filter])

  const checkSession = async () => {
    const session = await getSession()
    if (!session) {
      router.push("/login")
    }
  }

  const fetchSuggestions = async () => {
    try {
      const params = new URLSearchParams()
      if (filter) {
        params.append("status", filter)
      }
      const response = await fetch(`/api/edit-suggestions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (suggestionId: string) => {
    try {
      const response = await fetch(`/api/edit-suggestions/${suggestionId}/approve`, {
        method: "POST",
      })
      if (response.ok) {
        fetchSuggestions()
      }
    } catch (error) {
      console.error("Error approving suggestion:", error)
    }
  }

  const handleReject = async (suggestionId: string, reviewNotes: string) => {
    try {
      const response = await fetch(`/api/edit-suggestions/${suggestionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "REJECTED",
          reviewNotes,
        }),
      })
      if (response.ok) {
        fetchSuggestions()
      }
    } catch (error) {
      console.error("Error rejecting suggestion:", error)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Edit Suggestions</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2"
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No suggestions found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>
                      {suggestion.suggestionType === "ADD_NEW_WORD"
                        ? "New Word Suggestion"
                        : "Edit Suggestion"}
                    </CardTitle>
                    <CardDescription>
                      {suggestion.word
                        ? `Word: ${suggestion.word.wordMaithili}`
                        : "New word"}
                    </CardDescription>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      suggestion.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : suggestion.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {suggestion.status.replace("_", " ")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Contact:</span> {suggestion.email} | {suggestion.phone}
                  </div>
                  {suggestion.name && (
                    <div>
                      <span className="font-medium">Name:</span> {suggestion.name}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Dictionary:</span> {suggestion.dictionary.name}
                  </div>
                  <div>
                    <span className="font-medium">Submitted:</span>{" "}
                    {new Date(suggestion.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="mb-4 rounded bg-gray-50 p-4">
                  <h4 className="mb-2 font-medium">Suggestion Details:</h4>
                  <pre className="text-sm text-gray-700">
                    {JSON.stringify(suggestion.suggestionData, null, 2)}
                  </pre>
                </div>

                {suggestion.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(suggestion.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const notes = prompt("Enter rejection reason:")
                        if (notes) {
                          handleReject(suggestion.id, notes)
                        }
                      }}
                    >
                      Reject
                    </Button>
                    {suggestion.word && (
                      <Link href={`/words/${suggestion.word.id}`}>
                        <Button variant="outline">View Word</Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

