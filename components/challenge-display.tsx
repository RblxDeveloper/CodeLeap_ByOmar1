"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeHighlighter } from "@/components/code-highlighter"
import { HtmlPreview } from "@/components/html-preview"
import { CheckCircle, XCircle, Code, Eye, Lightbulb, Info } from "lucide-react"
import type { Challenge } from "@/app/page"

interface ChallengeDisplayProps {
  challenge: Challenge
  onAnswer: (answer: boolean) => void
}

export function ChallengeDisplay({ challenge, onAnswer }: ChallengeDisplayProps) {
  const [showAnswer, setShowAnswer] = useState(false)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getLanguageEmoji = (language: string) => {
    switch (language) {
      case "javascript":
        return "🟨"
      case "html":
        return "🟧"
      case "css":
        return "🟦"
      default:
        return "📝"
    }
  }

  const handleAnswer = (answer: boolean) => {
    setShowAnswer(true)
    onAnswer(answer)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>Code Challenge</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getDifficultyColor(challenge.difficulty)}>
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline">
              {getLanguageEmoji(challenge.language)} {challenge.language.toUpperCase()}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-base">{challenge.problem}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="code" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Code</span>
            </TabsTrigger>
            {challenge.language === "html" && (
              <TabsTrigger value="preview" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="code" className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span>What this code does:</span>
              </h4>
              <p className="text-sm text-muted-foreground">{challenge.codeExplanation}</p>
            </div>

            <CodeHighlighter code={challenge.code} language={challenge.language} />
          </TabsContent>

          {challenge.language === "html" && (
            <TabsContent value="preview">
              <HtmlPreview code={challenge.code} />
            </TabsContent>
          )}
        </Tabs>

        {!showAnswer && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-center">Is this code correct?</h4>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => handleAnswer(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Yes, it's correct
              </Button>
              <Button
                onClick={() => handleAnswer(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3"
                size="lg"
              >
                <XCircle className="h-5 w-5 mr-2" />
                No, there's an issue
              </Button>
            </div>
          </div>
        )}

        {showAnswer && (
          <Card
            className={`border-2 ${challenge.isCorrect ? "border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800" : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800"}`}
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  {challenge.isCorrect ? (
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  )}
                  <h4 className="text-lg font-semibold">
                    {challenge.isCorrect ? "Code is Correct!" : "Code has Issues!"}
                  </h4>
                  {challenge.userAnswer !== undefined && (
                    <Badge
                      variant={challenge.userAnswer === challenge.isCorrect ? "default" : "destructive"}
                      className="ml-2"
                    >
                      {challenge.userAnswer === challenge.isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium mb-1">Explanation:</h5>
                      <p className="text-sm text-muted-foreground">{challenge.explanation}</p>
                    </div>
                  </div>

                  {challenge.additionalInfo && (
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium mb-1">Additional Info:</h5>
                        <p className="text-sm text-muted-foreground">{challenge.additionalInfo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
