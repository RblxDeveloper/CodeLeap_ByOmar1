"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CodeHighlighter } from "@/components/code-highlighter"
import { History, CheckCircle, XCircle, Code, Calendar, Filter, Trash2 } from "lucide-react"
import type { Challenge } from "@/app/page"

interface ChallengeHistoryProps {
  challenges: Challenge[]
}

export function ChallengeHistory({ challenges }: ChallengeHistoryProps) {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [filterLanguage, setFilterLanguage] = useState<string>("all")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")

  const filteredChallenges = challenges.filter((challenge) => {
    const languageMatch = filterLanguage === "all" || challenge.language === filterLanguage
    const difficultyMatch = filterDifficulty === "all" || challenge.difficulty === filterDifficulty
    return languageMatch && difficultyMatch
  })

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const clearHistory = () => {
    localStorage.removeItem("codeleap-history")
    window.location.reload()
  }

  const getStats = () => {
    const total = challenges.length
    const correct = challenges.filter((c) => c.userAnswer === c.isCorrect).length
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

    return { total, correct, accuracy }
  }

  const stats = getStats()

  if (challenges.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No challenges yet</h3>
          <p className="text-muted-foreground">Complete some challenges to see your history and track your progress!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <History className="h-5 w-5" />
            <span>Your Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Challenges Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-sm text-muted-foreground">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.accuracy}%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filter Challenges</span>
            </CardTitle>
            <Button variant="outline" size="sm" onClick={clearHistory}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="javascript">🟨 JavaScript</SelectItem>
                  <SelectItem value="html">🟧 HTML</SelectItem>
                  <SelectItem value="css">🟦 CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Challenge List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Challenge History ({filteredChallenges.length})</CardTitle>
            <CardDescription>Click on a challenge to view details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${selectedChallenge?.id === challenge.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setSelectedChallenge(challenge)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(challenge.difficulty)} variant="secondary">
                        {challenge.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {getLanguageEmoji(challenge.language)} {challenge.language.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      {challenge.userAnswer !== undefined && (
                        <>
                          {challenge.userAnswer === challenge.isCorrect ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </>
                      )}
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{formatDate(challenge.timestamp)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{challenge.problem}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Challenge Detail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>Challenge Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedChallenge ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                      {selectedChallenge.difficulty.charAt(0).toUpperCase() + selectedChallenge.difficulty.slice(1)}
                    </Badge>
                    <Badge variant="outline">
                      {getLanguageEmoji(selectedChallenge.language)} {selectedChallenge.language.toUpperCase()}
                    </Badge>
                  </div>
                  {selectedChallenge.userAnswer !== undefined && (
                    <Badge
                      variant={selectedChallenge.userAnswer === selectedChallenge.isCorrect ? "default" : "destructive"}
                    >
                      {selectedChallenge.userAnswer === selectedChallenge.isCorrect ? "Correct" : "Incorrect"}
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Problem:</h4>
                  <p className="text-sm text-muted-foreground">{selectedChallenge.problem}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Code:</h4>
                  <CodeHighlighter code={selectedChallenge.code} language={selectedChallenge.language} />
                </div>

                <div>
                  <h4 className="font-medium mb-2">Explanation:</h4>
                  <p className="text-sm text-muted-foreground">{selectedChallenge.explanation}</p>
                </div>

                {selectedChallenge.additionalInfo && (
                  <div>
                    <h4 className="font-medium mb-2">Additional Info:</h4>
                    <p className="text-sm text-muted-foreground">{selectedChallenge.additionalInfo}</p>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Completed on {formatDate(selectedChallenge.timestamp)}</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Code className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Select a challenge to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
