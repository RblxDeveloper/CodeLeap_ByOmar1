"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye } from "lucide-react"

interface HtmlPreviewProps {
  code: string
}

export function HtmlPreview({ code }: HtmlPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Eye className="h-4 w-4" />
          <span>HTML Preview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 bg-white dark:bg-gray-900 min-h-32">
          <div dangerouslySetInnerHTML={{ __html: code }} />
        </div>
      </CardContent>
    </Card>
  )
}
