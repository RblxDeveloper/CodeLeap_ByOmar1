import { type NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/models"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ valid: false, error: "API key is required" })
    }

    // Test the API key by making a simple request to list models
    const response = await fetch(GROQ_API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      return NextResponse.json({ valid: true })
    } else {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({
        valid: false,
        error: errorData.error?.message || "Invalid API key",
      })
    }
  } catch (error) {
    console.error("Error validating API key:", error)
    return NextResponse.json({
      valid: false,
      error: "Failed to validate API key",
    })
  }
}
