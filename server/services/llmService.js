/**
 * NVIDIA NIM LLM Service for Dynamic English Quiz Question Generation
 *
 * Supported Models:
 * - meta/llama-3.1-8b-instruct (Recommended: ultra-fast, high accuracy, free tier on build.nvidia.com)
 * - meta/llama-3.3-70b-instruct (Flagship open model for complex grammar)
 * - mistralai/mistral-7b-instruct-v0.3 (Fast, low resource)
 */

function shuffleArray(array) {
  if (!Array.isArray(array)) return [];
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function cleanAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty response from LLM");
  }

  // Remove markdown code fences (```json ... ``` or ``` ...)
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }

  // Find first { or [ and last } or ]
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  let startIdx = 0;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = cleaned.lastIndexOf("}");
    if (lastBrace !== -1) {
      cleaned = cleaned.substring(startIdx, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = cleaned.lastIndexOf("]");
    if (lastBracket !== -1) {
      cleaned = cleaned.substring(startIdx, lastBracket + 1);
    }
  }

  return JSON.parse(cleaned);
}

/**
 * Generate questions via NVIDIA NIM API
 * @param {string} category - Category like Grammar, Vocabulary, Tenses, Articles, Prepositions, Mixed English
 * @param {string} difficulty - easy, medium, hard
 * @param {number} count - number of questions to generate
 * @returns {Promise<Array|null>} Array of questions or null if failed/not configured
 */
export async function generateQuestionsFromLLM(category = "Mixed English", difficulty = "medium", count = 10) {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return null; // Will fallback to curated questions bank
  }

  const model = process.env.NVIDIA_MODEL || "mistralai/mistral-7b-instruct-v0.3";
  const baseUrl = (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, "");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout

  try {
    const prompt = `Generate exactly ${count} multiple-choice English quiz questions.
Category: ${category === "Mixed English" ? "Mixed English (blend of Grammar, Vocabulary, Idioms, Prepositions, and Tenses)" : category}
Difficulty: ${difficulty}

Requirements:
1. Provide exactly ${count} questions.
2. For each question, provide exactly 4 options.
3. "correctAnswer" must match one of the 4 options exactly.
4. Provide a clear and concise "explanation".
5. Return JSON format only.

Output structure:
{
  "questions": [
    {
      "id": "q1",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "question": "The question text here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation here..."
    }
  ]
}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are an expert English educator and question writer. You only respond with valid JSON containing multiple-choice questions for English learners."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[NVIDIA NIM] API error (${response.status}):`, errText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.warn("[NVIDIA NIM] Empty response content from model");
      return null;
    }

    const parsed = cleanAndParseJSON(content);
    const rawQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || []);

    if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
      console.warn("[NVIDIA NIM] Parsed JSON did not contain an array of questions");
      return null;
    }

    // Validate and sanitize questions
    const validQuestions = [];
    const timestamp = Date.now();

    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      if (
        q &&
        typeof q.question === "string" &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === "string" &&
        q.options.includes(q.correctAnswer)
      ) {
        validQuestions.push({
          id: q.id || `nim_${timestamp}_${i + 1}`,
          category: q.category || category,
          difficulty: q.difficulty || difficulty,
          question: q.question.trim(),
          options: shuffleArray(q.options), // Fisher-Yates shuffle to randomize answer position
          correctAnswer: q.correctAnswer.trim(),
          explanation: (q.explanation || "").trim() || "Correct answer: " + q.correctAnswer
        });
      }
    }

    if (validQuestions.length === 0) {
      console.warn("[NVIDIA NIM] No valid questions passed verification");
      return null;
    }

    console.log(`[NVIDIA NIM] Successfully generated ${validQuestions.length} questions using ${model}`);
    return validQuestions.slice(0, count);

  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      console.warn("[NVIDIA NIM] Request timed out. Using fallback question bank.");
    } else {
      console.warn("[NVIDIA NIM] Generation failed:", error.message);
    }
    return null;
  }
}
