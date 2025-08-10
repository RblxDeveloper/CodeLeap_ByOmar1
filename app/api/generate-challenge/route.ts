import { type NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

// Fallback challenges for when AI is unavailable
const FALLBACK_CHALLENGES = {
  javascript: {
    easy: {
      id: "fallback-js-easy-1",
      problem: "This function should calculate the sum of two numbers. Does it work correctly?",
      code: `function addNumbers(a, b) {
  return a + b;
}

console.log(addNumbers(5, 3)); // Should output 8`,
      codeExplanation: "This function takes two parameters and returns their sum using the + operator.",
      language: "javascript" as const,
      difficulty: "easy" as const,
      isCorrect: true,
      explanation:
        "This code is correct! The function properly adds two numbers and returns the result. The + operator works correctly for numeric addition.",
      additionalInfo:
        "This is a basic example of a pure function - it takes inputs and returns an output without side effects.",
      timestamp: Date.now(),
    },
    medium: {
      id: "fallback-js-medium-1",
      problem: "This function should reverse a string. Is there an issue with the implementation?",
      code: `function reverseString(str) {
  let reversed = '';
  for (let i = str.length; i >= 0; i--) {
    reversed += str[i];
  }
  return reversed;
}

console.log(reverseString('hello')); // Should output 'olleh'`,
      codeExplanation: "This function attempts to reverse a string by iterating backwards through its characters.",
      language: "javascript" as const,
      difficulty: "medium" as const,
      isCorrect: false,
      explanation:
        'This code has a bug! The loop condition should be `i >= 0` but it starts at `str.length` instead of `str.length - 1`. This means it tries to access `str[str.length]` which is undefined, adding "undefined" to the beginning of the reversed string.',
      additionalInfo:
        "The correct loop should be: `for (let i = str.length - 1; i >= 0; i--)`. Array/string indices are 0-based, so the last character is at index `length - 1`.",
      timestamp: Date.now(),
    },
    hard: {
      id: "fallback-js-hard-1",
      problem: "This function implements a binary search algorithm. Does it handle all edge cases correctly?",
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}`,
      codeExplanation: "This function implements binary search to find a target value in a sorted array.",
      language: "javascript" as const,
      difficulty: "hard" as const,
      isCorrect: true,
      explanation:
        "This binary search implementation is correct! It properly handles all edge cases: empty arrays, single elements, target not found, and targets at the beginning or end of the array.",
      additionalInfo:
        "Binary search has O(log n) time complexity and requires the input array to be sorted. The algorithm repeatedly divides the search space in half.",
      timestamp: Date.now(),
    },
  },
  html: {
    easy: {
      id: "fallback-html-easy-1",
      problem: "This HTML creates a simple form. Is the structure valid?",
      code: `<form>
  <label for="username">Username:</label>
  <input type="text" id="username" name="username" required>
  
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  
  <button type="submit">Submit</button>
</form>`,
      codeExplanation: "This HTML creates a form with two input fields and a submit button.",
      language: "html" as const,
      difficulty: "easy" as const,
      isCorrect: true,
      explanation:
        'This HTML is correct! The form has proper labels associated with inputs using the "for" attribute, appropriate input types, and a submit button.',
      additionalInfo:
        'Good practices shown: semantic HTML, proper label association, input validation with "required", and appropriate input types.',
      timestamp: Date.now(),
    },
    medium: {
      id: "fallback-html-medium-1",
      problem: "This HTML table should display user data. Are there any accessibility issues?",
      code: `<table>
  <tr>
    <td>Name</td>
    <td>Age</td>
    <td>Email</td>
  </tr>
  <tr>
    <td>John Doe</td>
    <td>30</td>
    <td>john@example.com</td>
  </tr>
  <tr>
    <td>Jane Smith</td>
    <td>25</td>
    <td>jane@example.com</td>
  </tr>
</table>`,
      codeExplanation: "This HTML creates a table to display user information with headers and data rows.",
      language: "html" as const,
      difficulty: "medium" as const,
      isCorrect: false,
      explanation:
        "This HTML has accessibility issues! The table is missing proper semantic structure. The first row should use <th> elements instead of <td> for headers, and the table should have <thead> and <tbody> sections for better screen reader support.",
      additionalInfo:
        "Correct structure should use: <thead><tr><th>Name</th><th>Age</th><th>Email</th></tr></thead><tbody>...data rows...</tbody>",
      timestamp: Date.now(),
    },
    hard: {
      id: "fallback-html-hard-1",
      problem: "This HTML creates a complex form with validation. Are all accessibility requirements met?",
      code: `<form aria-labelledby="contact-form">
  <h2 id="contact-form">Contact Form</h2>
  
  <fieldset>
    <legend>Personal Information</legend>
    
    <div>
      <label for="name">Full Name *</label>
      <input type="text" id="name" name="name" required aria-describedby="name-error">
      <div id="name-error" role="alert" aria-live="polite"></div>
    </div>
    
    <div>
      <label for="phone">Phone Number</label>
      <input type="tel" id="phone" name="phone" aria-describedby="phone-help">
      <div id="phone-help">Format: (123) 456-7890</div>
    </div>
  </fieldset>
  
  <button type="submit">Send Message</button>
</form>`,
      codeExplanation:
        "This HTML creates an accessible contact form with proper ARIA attributes and semantic structure.",
      language: "html" as const,
      difficulty: "hard" as const,
      isCorrect: true,
      explanation:
        "This HTML is excellent! It demonstrates advanced accessibility practices: proper ARIA labels, fieldset grouping, error message association, live regions for dynamic content, and semantic structure.",
      additionalInfo:
        'Key accessibility features: aria-labelledby, aria-describedby, role="alert", aria-live="polite", fieldset/legend grouping, and proper form labeling.',
      timestamp: Date.now(),
    },
  },
  css: {
    easy: {
      id: "fallback-css-easy-1",
      problem: "This CSS should center a div horizontally and vertically. Will it work?",
      code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.centered-box {
  width: 200px;
  height: 200px;
  background-color: blue;
}`,
      codeExplanation: "This CSS uses flexbox to center a box both horizontally and vertically within its container.",
      language: "css" as const,
      difficulty: "easy" as const,
      isCorrect: true,
      explanation:
        "This CSS is correct! Flexbox with justify-content: center and align-items: center will perfectly center the child element both horizontally and vertically.",
      additionalInfo:
        "Flexbox is the modern standard for centering. The container takes full viewport height (100vh) and centers its content.",
      timestamp: Date.now(),
    },
    medium: {
      id: "fallback-css-medium-1",
      problem: "This CSS creates a responsive grid layout. Is there an issue with the implementation?",
      code: `.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
}

.grid-item {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
  min-height: 200px;
}`,
      codeExplanation:
        "This CSS creates a responsive grid that automatically adjusts the number of columns based on available space.",
      language: "css" as const,
      difficulty: "medium" as const,
      isCorrect: true,
      explanation:
        "This CSS is correct! The grid uses auto-fit with minmax() to create a responsive layout that automatically adjusts columns based on available space while maintaining a minimum width of 250px.",
      additionalInfo:
        "auto-fit collapses empty columns, while auto-fill would keep them. minmax(250px, 1fr) ensures items are at least 250px wide but can grow to fill available space.",
      timestamp: Date.now(),
    },
    hard: {
      id: "fallback-css-hard-1",
      problem: "This CSS implements a complex animation with transforms. Are there any performance issues?",
      code: `.animated-element {
  width: 100px;
  height: 100px;
  background-color: red;
  animation: complexMove 3s ease-in-out infinite;
}

@keyframes complexMove {
  0% {
    transform: translateX(0) rotate(0deg);
    left: 0px;
  }
  50% {
    transform: translateX(200px) rotate(180deg);
    left: 100px;
  }
  100% {
    transform: translateX(0) rotate(360deg);
    left: 0px;
  }
}`,
      codeExplanation:
        "This CSS creates an animation that moves and rotates an element using both transforms and position properties.",
      language: "css" as const,
      difficulty: "hard" as const,
      isCorrect: false,
      explanation:
        "This CSS has performance issues! Mixing transform and position properties (left) in the same animation can cause layout thrashing. The browser has to recalculate layout for position changes, while transforms are handled by the compositor.",
      additionalInfo:
        "For better performance, use only transform properties: translateX() for movement instead of left. Transforms are GPU-accelerated and don't trigger layout recalculations.",
      timestamp: Date.now(),
    },
  },
}

function cleanJsonString(str: string): string {
  // Remove markdown code blocks if present
  str = str.replace(/```json\s*\n?/g, "").replace(/```\s*$/g, "")

  // Remove any leading/trailing whitespace
  str = str.trim()

  // Find the first { and last } to extract just the JSON object
  const firstBrace = str.indexOf("{")
  const lastBrace = str.lastIndexOf("}")

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    str = str.substring(firstBrace, lastBrace + 1)
  }

  return str
}

export async function POST(request: NextRequest) {
  try {
    const { difficulty, language, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    const prompt = `Create a coding challenge for ${language} at ${difficulty} level. 

CRITICAL: You must return ONLY a valid JSON object. Do not use markdown code blocks, backticks, or any other formatting.

Return this exact JSON structure:
{
  "problem": "Clear description of what the code should do",
  "code": "The actual code to review - escape quotes and newlines properly",
  "codeExplanation": "Brief explanation of what this code does",
  "language": "${language}",
  "difficulty": "${difficulty}",
  "isCorrect": true,
  "explanation": "Detailed explanation of why the code is correct or what is wrong",
  "additionalInfo": "Extra learning tips or context"
}

Guidelines:
- Make it educational and realistic
- About 60% of challenges should have bugs/errors (isCorrect: false)
- For incorrect code, include subtle but meaningful errors
- Keep code concise but complete (max 15 lines)
- Explanation should be clear and educational
- For ${language}: focus on common patterns and potential pitfalls
- For ${difficulty}: adjust complexity appropriately
- In the "code" field, properly escape quotes and use \\n for newlines
- Do NOT use backticks anywhere in the response
- Return ONLY the JSON object, no other text or formatting

Example for JavaScript:
{
  "problem": "This function should check if a number is even",
  "code": "function isEven(num) {\\n  return num % 2 === 0;\\n}\\n\\nconsole.log(isEven(4));",
  "codeExplanation": "This function uses the modulo operator to check if a number is divisible by 2",
  "language": "javascript",
  "difficulty": "easy",
  "isCorrect": true,
  "explanation": "This code is correct! The modulo operator (%) returns the remainder of division, so num % 2 === 0 correctly identifies even numbers.",
  "additionalInfo": "The modulo operator is commonly used for checking divisibility and cycling through values."
}`

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are a coding instructor creating educational challenges. Always respond with valid JSON only, no markdown or formatting. Escape strings properly for JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      // Check for rate limit specifically
      if (response.status === 429) {
        const fallbackChallenge =
          FALLBACK_CHALLENGES[language as keyof typeof FALLBACK_CHALLENGES][
            difficulty as keyof typeof FALLBACK_CHALLENGES.javascript
          ]
        return NextResponse.json({
          ...fallbackChallenge,
          isRateLimit: true,
          fallbackUsed: true,
        })
      }

      throw new Error(`Groq API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error("No content received from Groq API")
    }

    try {
      // Clean the response to extract valid JSON
      const cleanedContent = cleanJsonString(content)
      console.log("Cleaned content:", cleanedContent)

      // Try to parse the JSON response
      const challenge = JSON.parse(cleanedContent)

      // Validate the response structure
      if (!challenge.problem || !challenge.code || !challenge.explanation) {
        throw new Error("Invalid challenge structure")
      }

      // Ensure required fields are present
      challenge.language = challenge.language || language
      challenge.difficulty = challenge.difficulty || difficulty
      challenge.isCorrect = challenge.isCorrect !== undefined ? challenge.isCorrect : true

      // Add metadata
      challenge.id = Date.now().toString()
      challenge.timestamp = Date.now()

      return NextResponse.json(challenge)
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      console.error("Raw content:", content)

      // Return fallback challenge
      const fallbackChallenge =
        FALLBACK_CHALLENGES[language as keyof typeof FALLBACK_CHALLENGES][
          difficulty as keyof typeof FALLBACK_CHALLENGES.javascript
        ]
      return NextResponse.json({
        ...fallbackChallenge,
        fallbackUsed: true,
      })
    }
  } catch (error) {
    console.error("Error generating challenge:", error)

    // Return fallback challenge on any error
    try {
      const { difficulty, language } = await request.json()
      const fallbackChallenge =
        FALLBACK_CHALLENGES[language as keyof typeof FALLBACK_CHALLENGES][
          difficulty as keyof typeof FALLBACK_CHALLENGES.javascript
        ]
      return NextResponse.json({
        ...fallbackChallenge,
        fallbackUsed: true,
      })
    } catch {
      // If we can't even parse the request, return a default challenge
      return NextResponse.json({
        ...FALLBACK_CHALLENGES.javascript.easy,
        fallbackUsed: true,
      })
    }
  }
}
