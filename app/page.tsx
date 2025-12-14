"use client"

import { SearchBar } from "@/components/search/SearchBar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation } from "@/lib/translations"

export default function Home() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex-1 bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">
              {t.home.title}
            </h2>
            <p className="mb-8 text-lg text-gray-600">
              {t.home.subtitle}
            </p>
            
            <div className="mb-12">
              <SearchBar />
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{t.home.browseDictionary}</CardTitle>
                  <CardDescription>
                    {t.home.browseDictionaryDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/words">
                    <Button className="w-full">{t.home.viewWords}</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.home.searchDiscover}</CardTitle>
                  <CardDescription>
                    {t.home.searchDiscoverDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/search">
                    <Button variant="outline" className="w-full">
                      {t.home.advancedSearch}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t.home.contribute}</CardTitle>
                  <CardDescription>
                    {t.home.contributeDesc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/edit-suggestion">
                    <Button variant="outline" className="w-full">
                      {t.home.suggestEdit}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>{t.home.footer}</p>
          <p className="mt-2">{t.home.footerOrg}</p>
        </div>
      </footer>
    </main>
  )
}
