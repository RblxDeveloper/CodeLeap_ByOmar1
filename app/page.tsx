"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChallengeDisplay } from "@/components/challenge-display"
import { ChallengeHistory } from "@/components/challenge-history"
import { LoadingGhost } from "@/components/loading-ghost"
import {
  Code2,
  Target,
  History,
  Sparkles,
  Brain,
  AlertCircle,
  Clock,
  CreditCard,
  Settings,
  Key,
  Eye,
  EyeOff,
} from "lucide-react"

export interface Challenge {
  id: string
  problem: string
  code: string
  codeExplanation: string
  language: "javascript" | "html" | "css"
  difficulty: "easy" | "medium" | "hard"
  isCorrect: boolean
  explanation: string
  additionalInfo?: string
  userAnswer?: boolean
  timestamp: number
}

export default function CodeLeapApp() {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [challengeHistory, setChallengeHistory] = useState<Challenge[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [selectedLanguage, setSelectedLanguage] = useState<"javascript" | "html" | "css">("javascript")
  const [activeTab, setActiveTab] = useState("challenge")
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [tempApiKey, setTempApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidatingKey, setIsValidatingKey] = useState(false)

  useEffect(() => {
    // Load challenge history from localStorage
    const savedHistory = localStorage.getItem("codeleap-history")
    if (savedHistory) {
      setChallengeHistory(JSON.parse(savedHistory))
    }

    // Check for saved API key
    const savedApiKey = localStorage.getItem("codeleap-api-key")
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])

  const saveToHistory = (challenge: Challenge) => {
    const updatedHistory = [challenge, ...challengeHistory].slice(0, 50)
    setChallengeHistory(updatedHistory)
    localStorage.setItem("codeleap-history", JSON.stringify(updatedHistory))
  }

  const validateAndSaveApiKey = async () => {
    if (!tempApiKey.trim()) {
      return
    }

    setIsValidatingKey(true)

    try {
      const response = await fetch("/api/validate-key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiKey: tempApiKey.trim() }),
      })

      const result = await response.json()

      if (result.valid) {
        setApiKey(tempApiKey.trim())
        localStorage.setItem("codeleap-api-key", tempApiKey.trim())
        setShowApiKeyDialog(false)
        setTempApiKey("")
        setGenerationError(null)
      } else {
        setGenerationError("Invalid API key. Please check your key and try again.")
      }
    } catch (error) {
      setGenerationError("Failed to validate API key. Please try again.")
    } finally {
      setIsValidatingKey(false)
    }
  }

  const generateChallenge = async () => {
    if (!apiKey) {
      setShowApiKeyDialog(true)
      return
    }

    const startTime = Date.now()
    setIsGenerating(true)
    setGenerationError(null)
    setIsUsingFallback(false)
    setGenerationTime(null)
    setIsRateLimited(false)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 35000)

      const response = await fetch("/api/generate-challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty: selectedDifficulty,
          language: selectedLanguage,
          apiKey: apiKey,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const endTime = Date.now()
      setGenerationTime(endTime - startTime)

      const challenge = await response.json()

      // Check for rate limit error
      if (challenge.isRateLimit) {
        setIsRateLimited(true)
        setGenerationError("Rate limit exceeded")
        setIsUsingFallback(true)
      } else if (challenge.fallbackUsed) {
        setIsUsingFallback(true)
        setGenerationError("AI was slow/unavailable, using curated challenge")
      }

      if (!response.ok && !challenge.id) {
        if (response.status === 401) {
          setGenerationError("Invalid API key. Please update your API key.")
          setShowApiKeyDialog(true)
          return
        }
        throw new Error(challenge.error || challenge.details || `HTTP error! status: ${response.status}`)
      }

      setCurrentChallenge({
        ...challenge,
        id: challenge.id || Date.now().toString(),
        timestamp: challenge.timestamp || Date.now(),
      })
    } catch (error) {
      const endTime = Date.now()
      setGenerationTime(endTime - startTime)

      console.error("Error generating challenge:", error)
      let errorMessage = "AI generation failed"

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          errorMessage = "AI is taking too long (35s timeout)"
        } else {
          errorMessage = error.message
        }
      }

      setGenerationError(errorMessage)
      setIsUsingFallback(true)
      setCurrentChallenge(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAnswer = (userAnswer: boolean) => {
    if (!currentChallenge) return

    const updatedChallenge = {
      ...currentChallenge,
      userAnswer,
    }

    setCurrentChallenge(updatedChallenge)
    saveToHistory(updatedChallenge)
  }

  const clearApiKey = () => {
    setApiKey("")
    localStorage.removeItem("codeleap-api-key")
    setGenerationError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">CodeLeap</h1>
              <p className="text-sm text-muted-foreground">AI Coding Challenges</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Key className="h-5 w-5" />
                    <span>API Key</span>
                  </DialogTitle>
                  <DialogDescription>Enter your API key to generate AI-powered coding challenges.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <div className="relative">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        placeholder="gsk_..."
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {generationError && <div className="text-sm text-red-600 dark:text-red-400">{generationError}</div>}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowApiKeyDialog(false)
                        setTempApiKey("")
                        setGenerationError(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <div className="space-x-2">
                      {apiKey && (
                        <Button variant="destructive" onClick={clearApiKey}>
                          Clear Key
                        </Button>
                      )}
                      <Button onClick={validateAndSaveApiKey} disabled={!tempApiKey.trim() || isValidatingKey}>
                        {isValidatingKey ? "Validating..." : "Save Key"}
                      </Button>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Your API key is stored locally in your browser</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="challenge" className="flex items-center space-x-2 cursor-pointer">
              <Target className="h-4 w-4" />
              <span>Challenge</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2 cursor-pointer">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="challenge" className="space-y-6">
            {/* API Key Required Notice */}
            {!apiKey && (
              <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-3">
                    <Key className="h-5 w-5" />
                    <span className="font-medium">API Key Required</span>
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                    <p>To generate AI-powered coding challenges, you need an API key.</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <Button
                        onClick={() => setShowApiKeyDialog(true)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Add API Key
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Welcome Section */}
            {!currentChallenge && !isGenerating && apiKey && (
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <Brain className="h-6 w-6 text-primary" />
                    <span>Welcome to CodeLeap!</span>
                  </CardTitle>
                  <CardDescription className="max-w-2xl mx-auto">
                    Test your coding skills with AI-generated challenges. Each challenge is unique and designed to help
                    you learn and improve your programming knowledge. Most challenges will contain subtle errors - can
                    you spot them?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4">
                      <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <h3 className="font-semibold">AI Generated</h3>
                      <p className="text-sm text-muted-foreground">Unique challenges every time</p>
                    </Card>
                    <Card className="p-4">
                      <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                      <h3 className="font-semibold">Mix of Correct & Incorrect</h3>
                      <p className="text-sm text-muted-foreground">Test your debugging skills</p>
                    </Card>
                    <Card className="p-4">
                      <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-semibold">Multiple Languages</h3>
                      <p className="text-sm text-muted-foreground">JavaScript, HTML, and CSS</p>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading Ghost */}
            {isGenerating && <LoadingGhost />}

            {/* Rate Limit Warning */}
            {isRateLimited && (
              <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 mb-3">
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">Rate Limit Reached</span>
                    {generationTime && (
                      <Badge variant="outline" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {(generationTime / 1000).toFixed(1)}s
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-orange-700 dark:text-orange-300 space-y-2">
                    <p>Your API has reached its rate limit. To continue generating AI challenges:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Wait for the rate limit to reset</li>
                      <li>Get faster response times</li>
                    </ul>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className="text-orange-600 dark:text-orange-400">•</span>
                      <span className="text-sm">Using curated challenge instead</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generation Status */}
            {(generationError || isUsingFallback) && !isRateLimited && (
              <Card
                className={`border-2 ${isUsingFallback ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800" : "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800"}`}
              >
                <CardContent className="pt-6">
                  <div
                    className={`flex items-center space-x-2 ${isUsingFallback ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">{isUsingFallback ? "Using Curated Challenge" : "AI Issue"}</span>
                    {generationTime && (
                      <Badge variant="outline" className="ml-2">
                        <Clock className="h-3 w-3 mr-1" />
                        {(generationTime / 1000).toFixed(1)}s
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`text-sm mt-2 ${isUsingFallback ? "text-yellow-700 dark:text-yellow-300" : "text-red-700 dark:text-red-300"}`}
                  >
                    {isUsingFallback ? "AI was taking too long, but here's a great challenge!" : generationError}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Challenge Controls */}
            {!isGenerating && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span>Generate {selectedLanguage.toUpperCase()} Challenge</span>
                  </CardTitle>
                  <CardDescription>
                    Create a unique {selectedLanguage} challenge at {selectedDifficulty} difficulty. Most challenges
                    will contain subtle errors to test your debugging skills!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty</label>
                      <Select
                        value={selectedDifficulty}
                        onValueChange={(value: "easy" | "medium" | "hard") => setSelectedDifficulty(value)}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy" className="cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span>Easy - Basic concepts</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="medium" className="cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                              <span>Medium - Intermediate</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="hard" className="cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span>Hard - Advanced</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <Select
                        value={selectedLanguage}
                        onValueChange={(value: "javascript" | "html" | "css") => setSelectedLanguage(value)}
                      >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript" className="cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <span>🟨</span>
                              <span>JavaScript</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="html" className="cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <span>🟧</span>
                              <span>HTML</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="css" className="cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <span>🟦</span>
                              <span>CSS</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={generateChallenge}
                    disabled={isGenerating}
                    className="w-full cursor-pointer hover:bg-primary/90 transition-colors"
                    size="lg"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {isGenerating ? "AI is thinking..." : apiKey ? `Generate Challenge` : "Add API Key First"}
                  </Button>
                  {!apiKey && (
                    <p className="text-sm text-muted-foreground text-center">
                      Please add your API key to generate challenges
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Current Challenge */}
            {currentChallenge && !isGenerating && (
              <ChallengeDisplay challenge={currentChallenge} onAnswer={handleAnswer} />
            )}
          </TabsContent>

          <TabsContent value="history">
            <ChallengeHistory challenges={challengeHistory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
