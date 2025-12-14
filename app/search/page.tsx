"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation, tf } from "@/lib/translations"

interface Dictionary {
  id: string
  name: string
  nameMaithili: string | null
  isMain: boolean
  _count?: {
    words: number
  }
}

interface Word {
  id: string
  wordMaithili: string
  wordRomanized: string | null
  pronunciation: string | null
  wordType: string | null
  dictionary: {
    id: string
    name: string
    nameMaithili: string | null
  }
  parameters: Array<{
    contentText: string | null
    language: string | null
  }>
}

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language } = useLanguage()
  const t = getTranslation(language)
  const query = searchParams.get("q") || ""
  const dictParam = searchParams.get("dict") || "all"
  
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [selectedDictionary, setSelectedDictionary] = useState<string>(
    dictParam === "all" ? "all" : dictParam || "all"
  )
  const [searchQuery, setSearchQuery] = useState(query)
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    fetchDictionaries()
    if (query) {
      performSearch(query, selectedDictionary === "all" ? null : selectedDictionary)
      setHasSearched(true)
    }
  }, [])

  const fetchDictionaries = async () => {
    try {
      const response = await fetch("/api/dictionaries")
      const data = await response.json()
      setDictionaries(data.filter((d: Dictionary) => d.isActive))
    } catch (error) {
      console.error("Error fetching dictionaries:", error)
    }
  }

  const performSearch = async (searchQuery: string, dictionaryId: string | null = null) => {
    if (!searchQuery.trim()) {
      setWords([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)
    try {
      const params = new URLSearchParams({ q: searchQuery })
      if (dictionaryId && dictionaryId !== "all") {
        params.append("dictionaryId", dictionaryId)
      }

      const response = await fetch(`/api/search?${params}`)
      const data = await response.json()
      setWords(data.words || [])
      
      // Update URL
      const newParams = new URLSearchParams()
      newParams.set("q", searchQuery)
      if (dictionaryId && dictionaryId !== "all") {
        newParams.set("dict", dictionaryId)
      }
      router.push(`/search?${newParams.toString()}`, { scroll: false })
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery, selectedDictionary === "all" ? null : selectedDictionary)
  }

  const handleDictionaryChange = (dictId: string) => {
    setSelectedDictionary(dictId)
    if (searchQuery.trim()) {
      performSearch(searchQuery, dictId === "all" ? null : dictId)
    }
  }

  const getDictionaryWordCount = (dictId: string) => {
    if (dictId === "all") {
      return words.length
    }
    return words.filter((w) => w.dictionary.id === dictId).length
  }

  // Sort dictionaries: main first, then others
  const sortedDictionaries = [...dictionaries].sort((a, b) => {
    if (a.isMain) return -1
    if (b.isMain) return 1
    return 0
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar with Dictionary Tabs */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Dictionary Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => handleDictionaryChange("all")}
                className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  selectedDictionary === "all"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                {t.search.allDictionaries}
                {hasSearched && words.length > 0 && (
                  <span className="ml-2 text-xs font-normal opacity-70">
                    ({words.length})
                  </span>
                )}
              </button>
              {sortedDictionaries.map((dict) => (
                <button
                  key={dict.id}
                  type="button"
                  onClick={() => handleDictionaryChange(dict.id)}
                  className={`px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                    selectedDictionary === dict.id
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  {dict.name}
                  {hasSearched && getDictionaryWordCount(dict.id) > 0 && (
                    <span className="ml-2 text-xs font-normal opacity-70">
                      ({getDictionaryWordCount(dict.id)})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Section */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.search.placeholder}
                className="h-14 text-lg pl-14 pr-32 border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl"
                autoFocus
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t.search.searching}
                  </span>
                ) : (
                  t.common.search
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Results Header */}
        {hasSearched && (
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? (
                  t.search.searching
                ) : words.length === 0 ? (
                  t.search.noResults
                ) : (
                  <>
                    {words.length === 1 
                      ? tf("search.resultFound", { query }, language)
                      : tf("search.resultsFound", { count: words.length, query }, language)
                    }
                  </>
                )}
              </h2>
              {query && !loading && selectedDictionary !== "all" && (
                <p className="text-sm text-gray-500 mt-1">
                  {tf("search.inDictionary", { 
                    name: sortedDictionaries.find((d) => d.id === selectedDictionary)?.name || (language === "maithili" ? "चयनित शब्दकोश" : "selected dictionary")
                  }, language)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-flex items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-600 font-medium">{t.search.searchingDictionaries}</span>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && hasSearched && words.length === 0 && query && (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg
                  className="mx-auto h-20 w-20 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                {t.search.noResults}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {tf("search.noResultsDesc", { query }, language)}
                <br />
                {t.search.tryDifferent}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setWords([])
                  setHasSearched(false)
                  router.push("/search")
                }}
                className="px-6"
              >
                {t.search.clearSearch}
              </Button>
            </div>
          </div>
        )}

        {/* Results List */}
        {!loading && words.length > 0 && (
          <div className="space-y-4">
            {words.map((word) => (
              <Card
                key={word.id}
                className="border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group"
              >
                <Link href={`/words/${word.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Word Header */}
                        <div className="flex items-baseline gap-3 mb-3">
                          <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {word.wordMaithili}
                          </h3>
                          {word.wordType && (
                            <span className="px-2.5 py-1 text-xs font-semibold text-gray-600 bg-gray-100 rounded-md uppercase tracking-wide">
                              {word.wordType}
                            </span>
                          )}
                        </div>

                        {/* Romanized and Pronunciation */}
                        <div className="mb-4 space-y-1">
                          {word.wordRomanized && (
                            <p className="text-lg text-gray-700 font-medium">
                              {word.wordRomanized}
                            </p>
                          )}
                          {word.pronunciation && (
                            <p className="text-sm text-gray-500 italic">
                              /{word.pronunciation}/
                            </p>
                          )}
                        </div>

                        {/* Meanings */}
                        {word.parameters.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {word.parameters
                              .filter((p) => p.contentText)
                              .slice(0, 3)
                              .map((param, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                  {param.language && (
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider min-w-[60px] pt-1">
                                      {param.language}
                                    </span>
                                  )}
                                  <p className="text-gray-700 leading-relaxed flex-1">
                                    {param.contentText}
                                  </p>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Dictionary Badge */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                            {word.dictionary.name}
                          </span>
                          <span className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                            {t.words.viewDetails}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State (No Search Yet) */}
        {!hasSearched && !query && (
          <div className="text-center py-24">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <svg
                  className="mx-auto h-24 w-24 text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                {t.search.emptyStateTitle}
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {t.search.emptyStateDesc}
                <br />
                {t.search.emptyStateDesc2}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  {dictionaries.length} {t.search.dictionaries}
                </span>
                <span className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                  {t.search.fastSearch}
                </span>
                <span className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium">
                  {t.search.multiLanguage}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
