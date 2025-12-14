"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation, tf } from "@/lib/translations"

interface Word {
  id: string
  wordMaithili: string
  wordRomanized: string | null
  pronunciation: string | null
  dictionary: {
    name: string
    nameMaithili: string | null
  }
  parameters: Array<{
    contentText: string | null
    language: string | null
  }>
}

export default function WordsPage() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchWords()
  }, [page, search])

  const fetchWords = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      })
      if (search) {
        params.append("search", search)
      }

      const response = await fetch(`/api/words?${params}`)
      const data = await response.json()
      setWords(data.words || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Error fetching words:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchWords()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-4 text-3xl font-bold">{t.words.allWords}</h1>
        
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <Input
            type="text"
            placeholder={t.search.placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit">{t.common.search}</Button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">{t.words.loading}</div>
      ) : words.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t.words.noWords}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {words.map((word) => (
              <Card key={word.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">
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
                  {word.parameters.length > 0 && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {word.parameters[0].contentText}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-gray-400">
                    {word.dictionary.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t.common.previous}
              </Button>
              <span className="flex items-center px-4">
                पृष्ठ {page} का {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t.common.next}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
