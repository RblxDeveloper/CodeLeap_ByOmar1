import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // This endpoint is no longer needed since we removed the default key
    // But keeping it for backward compatibility
    return NextResponse.json({ success: false, message: "Default key feature removed" })
  } catch (error) {
    console.error("Error in set-default-key:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
