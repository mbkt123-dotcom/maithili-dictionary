"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WordDetail {
  id: string
  wordMaithili: string
  wordRomanized: string | null
  pronunciation: string | null
  wordType: string | null
  dictionary: {
    name: string
    nameMaithili: string | null
  }
  parameters: Array<{
    id: string
    parameterKey: string
    language: string | null
    contentText: string | null
    contentJson: any
    contentRichText: string | null
    parameterDefinition: {
      parameterName: string
      parameterType: string
    }
  }>
  relationships: Array<{
    id: string
    relationshipType: string
    targetWord: {
      id: string
      wordMaithili: string
      wordRomanized: string | null
    }
  }>
  subWords: Array<{
    id: string
    wordMaithili: string
    wordRomanized: string | null
  }>
  parentWord: {
    id: string
    wordMaithili: string
    wordRomanized: string | null
  } | null
}

export default function WordDetailPage() {
  const params = useParams()
  const [word, setWord] = useState<WordDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchWord()
    }
  }, [params.id])

  const fetchWord = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/words/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setWord(data)
      }
    } catch (error) {
      console.error("Error fetching word:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading word details...</div>
      </div>
    )
  }

  if (!word) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Word not found</h1>
          <Link href="/words">
            <Button>Back to Words</Button>
          </Link>
        </div>
      </div>
    )
  }

  const meaningParams = word.parameters.filter(
    (p) => p.parameterKey === "meaning"
  )
  const otherParams = word.parameters.filter((p) => p.parameterKey !== "meaning")

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/words">
          <Button variant="outline">← Back to Words</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{word.wordMaithili}</CardTitle>
              {word.wordRomanized && (
                <CardDescription className="text-lg">
                  {word.wordRomanized}
                </CardDescription>
              )}
              {word.pronunciation && (
                <p className="mt-2 text-sm text-gray-500">
                  [{word.pronunciation}]
                </p>
              )}
              {word.wordType && (
                <span className="mt-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs">
                  {word.wordType}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {word.dictionary.name}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {meaningParams.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold">Meanings</h3>
              <div className="space-y-2">
                {meaningParams.map((param, idx) => (
                  <div key={param.id} className="border-l-4 border-blue-500 pl-4">
                    {param.language && (
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {param.language}
                      </span>
                    )}
                    <p className="mt-1">{param.contentText}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {otherParams.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold">Additional Information</h3>
              <div className="space-y-4">
                {otherParams.map((param) => (
                  <div key={param.id}>
                    <h4 className="font-medium text-gray-700">
                      {param.parameterDefinition.parameterName}
                    </h4>
                    <p className="mt-1 text-gray-600">
                      {param.contentText || JSON.stringify(param.contentJson)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {word.relationships.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold">Related Words</h3>
              <div className="flex flex-wrap gap-2">
                {word.relationships.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/words/${rel.targetWord.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {rel.targetWord.wordMaithili}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {word.subWords.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold">Sub-words</h3>
              <div className="flex flex-wrap gap-2">
                {word.subWords.map((subWord) => (
                  <Link
                    key={subWord.id}
                    href={`/words/${subWord.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {subWord.wordMaithili}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {word.parentWord && (
            <div>
              <h3 className="mb-3 text-lg font-semibold">Parent Word</h3>
              <Link
                href={`/words/${word.parentWord.id}`}
                className="text-blue-600 hover:underline"
              >
                {word.parentWord.wordMaithili}
              </Link>
            </div>
          )}

          <div className="mt-6 pt-6 border-t">
            <Link href={`/edit-suggestion?wordId=${word.id}`}>
              <Button variant="outline">Suggest Edit</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

