"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation } from "@/lib/translations"

export default function LoginPage() {
  const { language } = useLanguage()
  const t = getTranslation(language)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const message = searchParams.get("message")

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const session = await getSession()
      if (session) {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error("Session check error:", err)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading("credentials")
    setError(null)

    if (!formData.email || !formData.password) {
      setError("कृपया ईमेल और पासवर्ड दोनों दर्ज करें")
      setLoading(null)
      return
    }

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error)
        setLoading(null)
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।")
      setLoading(null)
    }
  }

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(provider)
    setError(null)
    try {
      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      })

      if (result?.error) {
        setError(`साइन इन विफल: ${result.error}`)
        setLoading(null)
        if (result.error === "OAuthAccountNotLinked" || result.error === "Configuration") {
          router.push(`/auth/error?error=${result.error}`)
        }
      } else if (result?.ok) {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।")
      setLoading(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  // Check which OAuth providers are available
  const hasGoogle = !!process.env.NEXT_PUBLIC_GOOGLE_ENABLED || true
  const hasFacebook = !!process.env.NEXT_PUBLIC_FACEBOOK_ENABLED
  const hasTwitter = !!process.env.NEXT_PUBLIC_TWITTER_ENABLED

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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold">{t.auth.welcomeBack}</CardTitle>
          <CardDescription className="text-base">
            {t.auth.signInTo}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-600 mt-0.5 mr-2 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t.common.email}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={!!loading}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t.common.password}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={!!loading}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  href="/forgot-password"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={!!loading}
            >
              {loading === "credentials" ? (
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
                  {t.auth.signingIn}
                </span>
              ) : (
                t.auth.signIn
              )}
            </Button>
          </form>

          {/* Divider */}
          {(hasGoogle || hasFacebook || hasTwitter) && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">या के साथ जारी रखें</span>
              </div>
            </div>
          )}

          {/* OAuth Providers */}
          {(hasGoogle || hasFacebook || hasTwitter) && (
            <div className="space-y-3">
              {hasGoogle && (
                <Button
                  className="w-full h-12 text-base font-medium bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                  onClick={() => handleOAuthSignIn("google")}
                  disabled={!!loading}
                  type="button"
                >
                  {loading === "google" ? (
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
                      {t.auth.signingIn}
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {t.auth.continueWithGoogle}
                    </span>
                  )}
                </Button>
              )}

              {hasFacebook && (
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                  onClick={() => handleOAuthSignIn("facebook")}
                  disabled={!!loading}
                  type="button"
                >
                  {loading === "facebook" ? (
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
                      {t.auth.signingIn}
                    </span>
                  ) : (
                    t.auth.continueWithFacebook
                  )}
                </Button>
              )}

              {hasTwitter && (
                <Button
                  variant="outline"
                  className="w-full h-12 text-base font-medium"
                  onClick={() => handleOAuthSignIn("twitter")}
                  disabled={!!loading}
                  type="button"
                >
                  {loading === "twitter" ? (
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
                      {t.auth.signingIn}
                    </span>
                  ) : (
                    t.auth.continueWithTwitter
                  )}
                </Button>
              )}
            </div>
          )}

          <div className="pt-4 border-t">
            <p className="text-sm text-center text-gray-600">
              {t.auth.dontHaveAccount}{" "}
              <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
                {t.auth.signUpHere}
              </Link>
            </p>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              {t.auth.bySigningIn}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
