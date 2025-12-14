import { maithili } from "./maithili"
import { english } from "./english"

export type Language = "maithili" | "english"

export const translations = {
  maithili,
  english,
}

// Helper function to get translation based on language
export function getTranslation(language: Language = "maithili") {
  return translations[language]
}

// Helper function to get nested translation
export function t(path: string, language: Language = "maithili"): string {
  const translation = getTranslation(language)
  const keys = path.split(".")
  let value: any = translation
  for (const key of keys) {
    value = value?.[key]
    if (value === undefined) return path
  }
  return typeof value === "string" ? value : path
}

// Helper function to format strings with placeholders
export function tf(
  path: string,
  params: Record<string, string | number>,
  language: Language = "maithili"
): string {
  let text = t(path, language)
  Object.entries(params).forEach(([key, value]) => {
    text = text.replace(`{${key}}`, String(value))
  })
  return text
}

// Re-export for convenience
export { maithili, english }





