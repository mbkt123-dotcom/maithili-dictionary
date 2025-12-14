"use client"

import { useEffect, useState } from "react"
import { getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Assignment {
  id: string
  word: {
    id: string
    wordMaithili: string
    wordRomanized: string | null
    dictionary: {
      name: string
    }
  }
  assignmentType: string
  priority: string
  status: string
  dueDate: string | null
  notes: string | null
}

export default function AssignmentsPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
    fetchAssignments()
  }, [])

  const checkSession = async () => {
    const session = await getSession()
    if (!session) {
      router.push("/login")
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/dashboard/assignments")
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error("Error fetching assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Assignments</h1>

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No assignments found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => (
            <Card key={assignment.id}>
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/words/${assignment.word.id}`}
                    className="hover:text-blue-600"
                  >
                    {assignment.word.wordMaithili}
                  </Link>
                </CardTitle>
                {assignment.word.wordRomanized && (
                  <CardDescription>{assignment.word.wordRomanized}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {assignment.assignmentType.replace("_", " ")}
                  </div>
                  <div>
                    <span className="font-medium">Priority:</span> {assignment.priority}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {assignment.status.replace("_", " ")}
                  </div>
                  {assignment.dueDate && (
                    <div>
                      <span className="font-medium">Due:</span> {new Date(assignment.dueDate).toLocaleDateString()}
                    </div>
                  )}
                  {assignment.notes && (
                    <div>
                      <span className="font-medium">Notes:</span> {assignment.notes}
                    </div>
                  )}
                </div>
                <Link href={`/words/${assignment.word.id}`}>
                  <Button variant="outline" className="w-full">
                    View Word
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

