"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code } from "lucide-react"

interface CodeHighlighterProps {
  code: string
  language: string
}

export function CodeHighlighter({ code, language }: CodeHighlighterProps) {
  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case "javascript":
        return "JavaScript"
      case "html":
        return "HTML"
      case "css":
        return "CSS"
      default:
        return "Code"
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Code className="h-4 w-4" />
          <span>{getLanguageLabel(language)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
          <code className="text-foreground whitespace-pre-wrap">{code}</code>
        </pre>
      </CardContent>
    </Card>
  )
}
