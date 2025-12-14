"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Word {
  id: string
  wordMaithili: string
  wordRomanized: string | null
  status: string
  createdAt: string
  dictionary: {
    name: string
  }
}

export default function MyWordsPage() {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
    fetchMyWords()
  }, [])

  const checkSession = async () => {
    const session = await getSession()
    if (!session) {
      router.push("/login")
    }
  }

  const fetchMyWords = async () => {
    try {
      const response = await fetch("/api/words/my-words")
      if (response.ok) {
        const data = await response.json()
        setWords(data)
      }
    } catch (error) {
      console.error("Error fetching my words:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      SUBMITTED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      PUBLISHED: "bg-purple-100 text-purple-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Words</h1>
        <Link href="/words/create">
          <Button>Create New Word</Button>
        </Link>
      </div>

      {words.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven&apos;t created any words yet.</p>
            <Link href="/words/create">
              <Button>Create Your First Word</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {words.map((word) => (
            <Card key={word.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>
                    <Link
                      href={`/words/${word.id}`}
                      className="hover:text-blue-600"
                    >
                      {word.wordMaithili}
                    </Link>
                  </CardTitle>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                      word.status
                    )}`}
                  >
                    {word.status.replace("_", " ")}
                  </span>
                </div>
                {word.wordRomanized && (
                  <CardDescription>{word.wordRomanized}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  {word.dictionary.name}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  Created: {new Date(word.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-4 flex gap-2">
                  <Link href={`/words/${word.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                  <Link href={`/words/${word.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

