"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Word {
  id: string
  wordMaithili: string
  wordRomanized: string | null
  status: string
  dictionary: {
    name: string
  }
  workflows: Array<{
    id: string
    currentStage: string
    status: string
    comments: string | null
  }>
}

export default function ReviewsPage() {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [action, setAction] = useState("")
  const [comments, setComments] = useState("")

  useEffect(() => {
    checkSession()
    fetchPendingReviews()
  }, [])

  const checkSession = async () => {
    const session = await getSession()
    if (!session) {
      router.push("/login")
    }
  }

  const fetchPendingReviews = async () => {
    try {
      const response = await fetch("/api/dashboard/pending-reviews")
      if (response.ok) {
        const data = await response.json()
        setWords(data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWorkflowAction = async (wordId: string) => {
    try {
      const response = await fetch(`/api/words/${wordId}/workflow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          comments,
        }),
      })

      if (response.ok) {
        fetchPendingReviews()
        setSelectedWord(null)
        setAction("")
        setComments("")
      }
    } catch (error) {
      console.error("Error processing workflow:", error)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Pending Reviews</h1>

      {words.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No words pending review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {words.map((word) => (
            <Card key={word.id}>
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/words/${word.id}`}
                    className="hover:text-blue-600"
                  >
                    {word.wordMaithili}
                  </Link>
                </CardTitle>
                {word.wordRomanized && (
                  <CardDescription>{word.wordRomanized}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {word.status}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Dictionary:</span> {word.dictionary.name}
                  </div>
                  {word.workflows.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">Stage:</span>{" "}
                      {word.workflows[0].currentStage.replace("_", " ")}
                    </div>
                  )}
                </div>

                {selectedWord?.id === word.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Action
                      </label>
                      <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                      >
                        <option value="">Select action</option>
                        <option value="approve">Approve</option>
                        <option value="reject">Reject</option>
                        <option value="return">Return for Revision</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Comments
                      </label>
                      <Input
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Enter comments..."
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleWorkflowAction(word.id)}
                        disabled={!action}
                      >
                        Submit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedWord(null)
                          setAction("")
                          setComments("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedWord(word)}
                    >
                      Review
                    </Button>
                    <Link href={`/words/${word.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
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

