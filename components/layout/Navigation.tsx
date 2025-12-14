"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation } from "@/lib/translations"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Navigation() {
  const { data: session, status } = useSession()
  const { language } = useLanguage()
  const t = getTranslation(language)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-blue-600">
            {language === "maithili" ? "मैथिली शब्दकोश" : "Maithili Dictionary"}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/words" className="text-sm hover:text-blue-600">
              {t.nav.words}
            </Link>
            <Link href="/search" className="text-sm hover:text-blue-600">
              {t.nav.search}
            </Link>
            <Link href="/edit-suggestion" className="text-sm hover:text-blue-600">
              {t.nav.suggestEdit}
            </Link>
            
            <LanguageSwitcher />
            
            {status === "loading" ? (
              <div className="text-sm text-gray-400">{t.common.loading}</div>
            ) : session ? (
              <>
                <Link href="/dashboard" className="text-sm hover:text-blue-600">
                  {t.nav.dashboard}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {session.user?.name || session.user?.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    {t.nav.signOut}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signup">
                  <Button variant="outline" size="sm">
                    {t.nav.signUp}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">{t.nav.login}</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
