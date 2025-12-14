"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation } from "@/lib/translations"

interface Session {
  user?: {
    id?: string
    email?: string
    name?: string
    role?: string
  }
}

const roleNames: Record<string, string> = {
  PUBLIC: "सार्वजनिक",
  FIELD_RESEARCHER: "फील्ड शोधकर्ता",
  EDITOR: "संपादक",
  SENIOR_EDITOR: "वरिष्ठ संपादक",
  EDITOR_IN_CHIEF: "मुख्य संपादक",
  ADMIN: "प्रशासक",
  SUPER_ADMIN: "सुपर प्रशासक",
}

export default function DashboardPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    myWords: 0,
    pendingReviews: 0,
    assignments: 0,
  })

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      try {
        const sessionData = await getSession()
        if (!isMounted) return

        if (!sessionData) {
          router.push("/login")
          return
        }

        setSession(sessionData)
        
        // Fetch stats in parallel
        try {
          const response = await fetch("/api/dashboard/stats")
          if (response.ok && isMounted) {
            const data = await response.json()
            setStats(data)
          }
        } catch (error) {
          console.error("Error fetching stats:", error)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initialize()

    return () => {
      isMounted = false
    }
  }, [router])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">{t.common.loading}</div>
  }

  if (!session) {
    return null
  }

  const userRole = (session.user as any)?.role || "PUBLIC"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>
          <p className="mt-2 text-gray-600">
            {t.dashboard.welcome}, {session.user?.name || session.user?.email}
          </p>
          <p className="text-sm text-gray-500">
            {t.dashboard.role}: {roleNames[userRole] || userRole}
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          {t.nav.signOut}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.myWords}</CardTitle>
            <CardDescription>{t.dashboard.myWordsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.myWords}</div>
            <Link href="/dashboard/my-words">
              <Button variant="outline" className="mt-4 w-full">
                {t.dashboard.viewMyWords}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {(userRole === "EDITOR" || userRole === "SENIOR_EDITOR" || userRole === "EDITOR_IN_CHIEF") && (
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.pendingReviews}</CardTitle>
              <CardDescription>{t.dashboard.pendingReviewsDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.pendingReviews}</div>
              <Link href="/dashboard/reviews">
                <Button variant="outline" className="mt-4 w-full">
                  {t.dashboard.reviewWords}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.assignments}</CardTitle>
            <CardDescription>{t.dashboard.assignmentsDesc}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.assignments}</div>
            <Link href="/dashboard/assignments">
              <Button variant="outline" className="mt-4 w-full">
                {t.dashboard.viewAssignments}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.dashboard.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/words/create">
              <Button className="w-full">{t.dashboard.createNewWord}</Button>
            </Link>
            <Link href="/words/bulk">
              <Button variant="outline" className="w-full">{t.dashboard.bulkWordEntry}</Button>
            </Link>
            <Link href="/words/excel-upload">
              <Button variant="outline" className="w-full">{t.nav.excelUpload}</Button>
            </Link>
            <Link href="/words">
              <Button variant="outline" className="w-full">{t.dashboard.browseAllWords}</Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full">{t.dashboard.searchDictionary}</Button>
            </Link>
          </CardContent>
        </Card>

        {(userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.adminActions}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/dictionaries">
                <Button variant="outline" className="w-full">
                  {t.dashboard.manageDictionaries}
                </Button>
              </Link>
              <Link href="/admin/edit-suggestions">
                <Button variant="outline" className="w-full">
                  {t.dashboard.reviewEditSuggestions}
                </Button>
              </Link>
              <Link href="/admin/parameters">
                <Button variant="outline" className="w-full">
                  {t.dashboard.manageParameters}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
