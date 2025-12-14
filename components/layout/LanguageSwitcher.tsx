"use client"

import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "@/components/ui/button"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2 border rounded-lg p-1 bg-gray-50">
      <Button
        variant={language === "maithili" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("maithili")}
        className="text-xs px-3 py-1 h-7"
      >
        मैथिली
      </Button>
      <Button
        variant={language === "english" ? "default" : "ghost"}
        size="sm"
        onClick={() => setLanguage("english")}
        className="text-xs px-3 py-1 h-7"
      >
        English
      </Button>
    </div>
  )
}





