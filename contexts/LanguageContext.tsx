"use client"

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react"
import { Language } from "@/lib/translations"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const VALID_LANGUAGES: Language[] = ["maithili", "english"]

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("maithili")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem("preferredLanguage") as Language
      if (savedLanguage && VALID_LANGUAGES.includes(savedLanguage)) {
        setLanguageState(savedLanguage)
      }
    } catch (error) {
      // localStorage might not be available (SSR)
      console.warn("Failed to read language preference:", error)
    } finally {
      setMounted(true)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    if (!VALID_LANGUAGES.includes(lang)) {
      console.warn(`Invalid language: ${lang}`)
      return
    }
    setLanguageState(lang)
    try {
      localStorage.setItem("preferredLanguage", lang)
    } catch (error) {
      console.warn("Failed to save language preference:", error)
    }
  }, [])

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage])

  // Always provide the context, even during SSR/hydration
  // This prevents errors when children use useLanguage() hook
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}


