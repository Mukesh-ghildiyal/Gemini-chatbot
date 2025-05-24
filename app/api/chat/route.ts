import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

// Set the maximum duration for streaming responses
export const maxDuration = 30

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
]

export async function POST(req: NextRequest) {
  try {
    // Get API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 })
    }

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey)

    // Use gemini-1.5-flash instead of gemini-1.5-pro to reduce quota usage
    const modelName = "gemini-1.5-flash"

    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048, // Limit output tokens to reduce quota usage
      },
    })

    // Parse the request body
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    // Format messages for Gemini
    const formattedHistory = messages.slice(0, -1).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))

    // Get the latest user message
    const latestMessage = messages[messages.length - 1]

    // Create a chat session
    const chat = model.startChat({
      history: formattedHistory,
    })

    // Generate a streaming response
    const result = await chat.sendMessageStream(latestMessage.content)

    // Create a readable stream to send the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text()
            controller.enqueue(new TextEncoder().encode(text))
          }
          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.error(error)
        }
      },
    })

    // Return the stream as a response
    return new NextResponse(stream)
  } catch (error) {
    console.error("Error in chat API:", error)

    // Check if it's a rate limit error (429)
    const errorMessage = error.toString()
    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. The API is currently experiencing high demand. Please try again in a few moments.",
          isRateLimit: true,
        },
        { status: 429 },
      )
    }

    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
