import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ThankYouPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-3xl">Thank You!</CardTitle>
          <CardDescription className="text-center">
            Your suggestion has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-600">
            We&apos;ve received your edit suggestion and will review it soon. You&apos;ll
            be notified via email once it&apos;s been processed.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
            <Link href="/words">
              <Button variant="outline">Browse Words</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

