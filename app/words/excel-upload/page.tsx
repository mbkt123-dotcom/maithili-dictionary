"use client"

import { useState, useEffect } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguage } from "@/contexts/LanguageContext"
import { getTranslation, tf } from "@/lib/translations"

interface Dictionary {
  id: string
  name: string
  nameMaithili: string | null
  isActive: boolean
}

export default function ExcelUploadPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = getTranslation(language)
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
  const [selectedDictionary, setSelectedDictionary] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    created: number
    errors: number
    errorDetails?: string[]
  } | null>(null)

  useEffect(() => {
    checkSession()
    fetchDictionaries()
  }, [])

  const checkSession = async () => {
    const session = await getSession()
    if (!session) {
      router.push("/login?callbackUrl=/words/excel-upload")
      return
    }
    // Redirect to dashboard if accessed directly (should only be from dashboard)
    // Allow direct access but show a note
  }

  const fetchDictionaries = async () => {
    try {
      const response = await fetch("/api/dictionaries")
      if (response.ok) {
        const data = await response.json()
        const activeDicts = data.filter((d: Dictionary) => d.isActive)
        setDictionaries(activeDicts)
        if (activeDicts.length > 0) {
          const mainDict = activeDicts.find((d: Dictionary) => d.isMain)
          setSelectedDictionary(mainDict ? mainDict.id : activeDicts[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching dictionaries:", error)
    }
  }

  const handleDownloadTemplate = async () => {
    if (!selectedDictionary) {
      alert("कृपया पहले एक शब्दकोश चुनें")
      return
    }

    try {
      const response = await fetch(
        `/api/words/excel-template?dictionaryId=${selectedDictionary}`
      )
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        
        // Get filename from Content-Disposition header or use default
        const contentDisposition = response.headers.get("Content-Disposition")
        let filename = "maithili-dictionary-template.xlsx"
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert("टेम्प्लेट डाउनलोड करने में विफल")
      }
    } catch (error) {
      console.error("Error downloading template:", error)
      alert("टेम्प्लेट डाउनलोड करने में त्रुटि")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        ".xlsx",
        ".xls",
      ]
      const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()

      if (
        !validTypes.includes(selectedFile.type) &&
        fileExtension !== "xlsx" &&
        fileExtension !== "xls"
      ) {
        alert("कृपया एक वैध एक्सेल फ़ाइल (.xlsx या .xls) अपलोड करें")
        return
      }

      setFile(selectedFile)
      setUploadResult(null)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      alert("कृपया अपलोड करने के लिए एक फ़ाइल चुनें")
      return
    }

    if (!selectedDictionary) {
      alert("कृपया एक शब्दकोश चुनें")
      return
    }

    setUploading(true)
    setUploadResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("dictionaryId", selectedDictionary)

      const response = await fetch("/api/words/excel-upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadResult({
          success: true,
          created: result.created,
          errors: result.errors,
          errorDetails: result.errorDetails,
        })
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById(
          "file-input"
        ) as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }
      } else {
        setUploadResult({
          success: false,
          created: 0,
          errors: 1,
          errorDetails: [result.error || "Upload failed"],
        })
      }
    } catch (error: any) {
      console.error("Error uploading file:", error)
      setUploadResult({
        success: false,
        created: 0,
        errors: 1,
        errorDetails: [error.message || "Error uploading file"],
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t.excelUpload.title}</h1>
            <p className="mt-2 text-gray-600">
              {t.excelUpload.desc}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard")}
          >
            {t.common.back} {t.dashboard.title}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Download Template Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.excelUpload.downloadTemplate}</CardTitle>
            <CardDescription>
              {t.excelUpload.downloadTemplateDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                {t.excelUpload.templateIncludes}:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>{t.excelUpload.templateInclude1}</li>
                <li>{t.excelUpload.templateInclude2}</li>
                <li>{t.excelUpload.templateInclude3}</li>
                <li>{t.excelUpload.templateInclude4}</li>
              </ul>
              {selectedDictionary && (
                <p className="text-xs text-blue-700 mt-2">
                  <strong>{t.excelUpload.note}:</strong> {t.excelUpload.customColumnsNote}
                  {t.excelUpload.customColumnsNote2}
                </p>
              )}
            </div>
              <Button
                onClick={handleDownloadTemplate}
                className="w-full"
                variant="outline"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {t.excelUpload.downloadTemplate}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload File Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t.excelUpload.uploadExcel}</CardTitle>
            <CardDescription>
              {t.excelUpload.uploadExcelDesc}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.excelUpload.selectDictionary} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedDictionary}
                  onChange={(e) => setSelectedDictionary(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                  disabled={uploading}
                >
                  <option value="">{t.excelUpload.selectDictionary}</option>
                  {dictionaries.map((dict) => (
                    <option key={dict.id} value={dict.id}>
                      {dict.name} {dict.nameMaithili && `(${dict.nameMaithili})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.excelUpload.selectFile} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="file-input"
                  type="file"
                  accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleFileChange}
                  disabled={uploading}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.excelUpload.acceptedFormats}: .xlsx, .xls
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={uploading || !file || !selectedDictionary}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                    {t.excelUpload.uploading}
                  </span>
                ) : (
                  t.excelUpload.uploadFile
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>
              {uploadResult.success ? t.excelUpload.uploadSuccessful : t.excelUpload.uploadFailed}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadResult.success ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="font-medium">
                      {tf("excelUpload.successfullyCreated", { count: uploadResult.created }, language)}
                    </span>
                  </div>
                </div>
                {uploadResult.errors > 0 && (
                  <div className="rounded-lg bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                      {tf("excelUpload.rowsHadErrors", { count: uploadResult.errors }, language)}
                    </p>
                  </div>
                )}
                {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
                  <div className="rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-medium mb-2">{t.excelUpload.errorDetails}:</p>
                    <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                      {uploadResult.errorDetails.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  onClick={() => router.push("/words")}
                  variant="outline"
                >
                  {t.excelUpload.viewWords}
                </Button>
              </div>
            ) : (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="text-red-800">
                  {uploadResult.errorDetails?.[0] || t.excelUpload.uploadFailed}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t.excelUpload.instructions}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="font-medium mb-1">{t.excelUpload.step1}</h3>
              <p className="text-gray-600">
                {t.excelUpload.step1Desc}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">{t.excelUpload.step2}</h3>
              <p className="text-gray-600">
                {t.excelUpload.step2Desc}
              </p>
              <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                <li>{t.excelUpload.step2List1}</li>
                <li>{t.excelUpload.step2List2}</li>
                <li>{t.excelUpload.step2List3}</li>
                <li>{t.excelUpload.step2List4}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-1">{t.excelUpload.step3}</h3>
              <p className="text-gray-600">
                {t.excelUpload.step3Desc}
              </p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>{t.excelUpload.note}:</strong> {t.excelUpload.noteText}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

