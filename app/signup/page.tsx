"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation } from "@/lib/translations"

export default function SignupPage() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "ईमेल आवश्यक है"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "अमान्य ईमेल पता"
    }

    if (!formData.password) {
      newErrors.password = "पासवर्ड आवश्यक है"
    } else if (formData.password.length < 8) {
      newErrors.password = "पासवर्ड कम से कम 8 अक्षर का होना चाहिए"
    } else {
      // Check password strength
      const hasUpperCase = /[A-Z]/.test(formData.password)
      const hasLowerCase = /[a-z]/.test(formData.password)
      const hasNumber = /[0-9]/.test(formData.password)
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)

      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecial) {
        newErrors.password =
          "पासवर्ड में अपरकेस, लोअरकेस, संख्या और विशेष वर्ण होना चाहिए"
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "कृपया अपने पासवर्ड की पुष्टि करें"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "पासवर्ड मेल नहीं खाते"
    }

    if (formData.fullName && formData.fullName.length < 2) {
      newErrors.fullName = "नाम कम से कम 2 अक्षर का होना चाहिए"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Create account
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.details) {
          // Validation errors
          const fieldErrors: Record<string, string> = {}
          data.details.forEach((detail: any) => {
            if (detail.path) {
              fieldErrors[detail.path[0]] = detail.message
            }
          })
          setErrors(fieldErrors)
        } else {
          setErrors({ submit: data.error || "खाता बनाने में विफल" })
        }
        setLoading(false)
        return
      }

      // Auto sign in after successful signup
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setErrors({ submit: "खाता बनाया गया लेकिन साइन इन विफल। कृपया लॉगिन करने का प्रयास करें।" })
        setLoading(false)
        router.push("/login?message=खाता सफलतापूर्वक बनाया गया। कृपया साइन इन करें।")
        return
      }

      // Success - redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      console.error("Signup error:", error)
      setErrors({ submit: error.message || "एक अप्रत्याशित त्रुटि हुई" })
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 px-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-8 w-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold">{t.auth.createAccount}</CardTitle>
          <CardDescription className="text-base">
            {t.auth.signUpTo}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-medium text-red-800">{errors.submit}</p>
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                {t.common.fullName} ({t.common.optional})
              </label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="जॉन डो"
                className={errors.fullName ? "border-red-500" : ""}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.common.email} <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t.common.password} <span className="text-red-500">*</span>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                कम से कम 8 अक्षर होने चाहिए, अपरकेस, लोअरकेस, संख्या और विशेष वर्ण के साथ
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t.common.confirmPassword} <span className="text-red-500">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t.auth.creatingAccount}
                </span>
              ) : (
                t.auth.createAccount
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t.auth.alreadyHaveAccount}</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                {t.auth.signInHere} →
              </Link>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              खाता बनाकर, आप हमारी सेवा की शर्तें और गोपनीयता नीति से सहमत हैं।
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
