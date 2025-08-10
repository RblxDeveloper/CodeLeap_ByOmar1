"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Brain, Sparkles } from "lucide-react"

export function LoadingGhost() {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Brain className="h-16 w-16 text-purple-500 animate-pulse" />
            <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">AI is crafting your challenge...</h3>
            <p className="text-muted-foreground max-w-md">
              Creating a unique coding puzzle just for you. This might take a moment while our AI thinks of something
              clever!
            </p>
          </div>

          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        </div>

        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-purple-500/5 animate-pulse"></div>
      </CardContent>
    </Card>
  )
}
