/**
 * NVIDIA NIM LLM Service for Dynamic English Quiz Question Generation
 * Features multi-strategy parsing to handle:
 * 1. Standard JSON responses
 * 2. Partial/truncated JSON with unescaped quotes
 * 3. Markdown / line-based question outputs
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

/**
 * Validates, formats, and ensures 4 options + matching correct answer
 */
function sanitizeQuestionList(rawList, category, difficulty) {
  if (!Array.isArray(rawList)) return [];
  const valid = [];
  const timestamp = Date.now();

  for (let i = 0; i < rawList.length; i++) {
    const q = rawList[i];
    if (!q || typeof q.question !== "string" || !q.question.trim()) continue;

    const questionText = q.question.trim();
    let options = Array.isArray(q.options)
      ? q.options.map(opt => String(opt || "").trim()).filter(Boolean)
      : [];

    // Deduplicate options while preserving order
    options = [...new Set(options)];

    // If fewer than 2 options, discard as incomplete
    if (options.length < 2) continue;

    // Pad or trim to exactly 4 options
    if (options.length === 2) {
      options.push("Both A and B", "Neither A nor B");
    } else if (options.length === 3) {
      options.push("None of the above");
    } else if (options.length > 4) {
      options = options.slice(0, 4);
    }

    let correctAnswer = String(q.correctAnswer || "").trim();

    // Handle letter answers like "A", "Option A", "B) Something"
    const letterMatch = correctAnswer.match(/^(?:option\s*)?([A-D])(?:[\.\:\)]|\s|$)/i);
    if (letterMatch) {
      const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (idx >= 0 && idx < options.length) {
        correctAnswer = options[idx];
      }
    }

    // If correctAnswer doesn't match an option, search for partial match
    if (!options.includes(correctAnswer)) {
      const found = options.find(opt =>
        opt.toLowerCase() === correctAnswer.toLowerCase() ||
        correctAnswer.toLowerCase().includes(opt.toLowerCase()) ||
        opt.toLowerCase().includes(correctAnswer.toLowerCase())
      );
      correctAnswer = found || options[0];
    }

    valid.push({
      id: q.id || `nim_${timestamp}_${i + 1}`,
      category: q.category || category,
      difficulty: q.difficulty || difficulty,
      question: questionText,
      options: shuffleArray(options), // Fisher-Yates shuffle
      correctAnswer: correctAnswer,
      explanation: String(q.explanation || "").trim() || `The correct answer is: ${correctAnswer}`
    });
  }

  return valid;
}

/**
 * Robust Multi-Strategy Parser:
 * 1. Standard JSON.parse on full text
 * 2. Per-object JSON extraction with regex (handles unescaped quotes & truncated JSON)
 * 3. Text / Markdown line-based pattern parsing (1. Question ... A) ... B) ... Answer: ...)
 */
function parseQuestionsFromAnyOutput(rawText, category, difficulty) {
  if (!rawText || typeof rawText !== "string") return [];

  let text = rawText.trim();
  // Strip markdown code fences if present
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  // --- Strategy 1: Standard JSON Parsing ---
  try {
    let jsonText = text;
    const firstBrace = jsonText.indexOf("{");
    const firstBracket = jsonText.indexOf("[");

    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      const lastBrace = jsonText.lastIndexOf("}");
      if (lastBrace !== -1) jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else if (firstBracket !== -1) {
      const lastBracket = jsonText.lastIndexOf("]");
      if (lastBracket !== -1) jsonText = jsonText.substring(firstBracket, lastBracket + 1);
    }

    // Clean trailing commas before } or ]
    jsonText = jsonText.replace(/,\s*([}\]])/g, "$1");

    const parsed = JSON.parse(jsonText);
    const list = Array.isArray(parsed) ? parsed : (parsed.questions || parsed.data || parsed.quiz || []);
    const sanitized = sanitizeQuestionList(list, category, difficulty);
    if (sanitized.length > 0) return sanitized;
  } catch (_) {
    // Strategy 1 failed, proceed to Strategy 2
  }

  // --- Strategy 2: Chunk-by-Chunk Object Extraction (Handles unescaped quotes & truncated JSON) ---
  try {
    const chunkResults = [];
    const objRegex = /\{[^{}]*?"question"[\s\S]*?"options"[\s\S]*?\}/g;
    const matchedBlocks = text.match(objRegex) || [];

    for (const block of matchedBlocks) {
      try {
        const cleanedBlock = block.replace(/,\s*\}/g, "}");
        const singleObj = JSON.parse(cleanedBlock);
        if (singleObj.question && Array.isArray(singleObj.options)) {
          chunkResults.push(singleObj);
          continue;
        }
      } catch (_) {
        // Fall through to regex extraction
      }

      // Regex field extraction bypassing unescaped quote errors
      const qMatch = block.match(/"question"\s*:\s*"([\s\S]*?)"\s*,\s*"options"/i) ||
                     block.match(/"question"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i);
      const optMatch = block.match(/"options"\s*:\s*\[([\s\S]*?)\]/i);
      const ansMatch = block.match(/"correctAnswer"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i) ||
                       block.match(/"correctAnswer"\s*:\s*"([\s\S]*?)"\s*,\s*"explanation"/i);
      const expMatch = block.match(/"explanation"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/i) ||
                       block.match(/"explanation"\s*:\s*"([\s\S]*?)"\s*[\},]/i);

      if (qMatch && optMatch) {
        const question = qMatch[1].replace(/\\"/g, '"').trim();
        const rawOptions = optMatch[1];
        const options = [];
        const optItemRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
        let m;
        while ((m = optItemRegex.exec(rawOptions)) !== null) {
          options.push(m[1].replace(/\\"/g, '"').trim());
        }

        if (question && options.length >= 2) {
          chunkResults.push({
            question,
            options,
            correctAnswer: ansMatch ? ansMatch[1].replace(/\\"/g, '"').trim() : options[0],
            explanation: expMatch ? expMatch[1].replace(/\\"/g, '"').trim() : ""
          });
        }
      }
    }

    const sanitized = sanitizeQuestionList(chunkResults, category, difficulty);
    if (sanitized.length > 0) return sanitized;
  } catch (_) {
    // Strategy 2 failed, proceed to Strategy 3
  }

  // --- Strategy 3: Text / Markdown line-based pattern parsing ---
  try {
    const textResults = [];
    const sections = text.split(/\n(?=(?:\d+[\.\)]|\*{0,2}Question\s*\d*[\:\.]))/i);

    for (const section of sections) {
      const lines = section.split("\n").map(l => l.trim()).filter(Boolean);
      if (lines.length < 3) continue;

      let question = "";
      const options = [];
      let correctAnswer = "";
      let explanation = "";

      for (const line of lines) {
        const qLineMatch = line.match(/^(?:\d+[\.\)]|\*{0,2}Question\s*\d*[\:\.]\s*)(.+)/i);
        if (qLineMatch && !question) {
          question = qLineMatch[1].replace(/\*\*/g, "").trim();
          continue;
        }

        const optLineMatch = line.match(/^(?:[A-D][\.\)\:]|\[[A-D]\]|\d[\.\)\:])\s*(.+)/i);
        if (optLineMatch && options.length < 4) {
          options.push(optLineMatch[1].replace(/\*\*/g, "").trim());
          continue;
        }

        const ansLineMatch = line.match(/^(?:Correct\s*)?Answer\s*[\:\.]\s*(.+)/i);
        if (ansLineMatch) {
          correctAnswer = ansLineMatch[1].replace(/\*\*/g, "").trim();
          continue;
        }

        const expLineMatch = line.match(/^Explanation\s*[\:\.]\s*(.+)/i);
        if (expLineMatch) {
          explanation = expLineMatch[1].replace(/\*\*/g, "").trim();
          continue;
        }
      }

      if (question && options.length >= 2) {
        textResults.push({
          question,
          options,
          correctAnswer: correctAnswer || options[0],
          explanation
        });
      }
    }

    const sanitized = sanitizeQuestionList(textResults, category, difficulty);
    if (sanitized.length > 0) return sanitized;
  } catch (_) {
    // Strategy 3 failed
  }

  return [];
}

/**
 * Generate questions via NVIDIA NIM API with ultra-resilient parsing
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

  const model = process.env.NVIDIA_MODEL || "z-ai/glm-5.3-flash";
  const baseUrl = (process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1").replace(/\/+$/, "");
  const timeoutMs = parseInt(process.env.LLM_TIMEOUT_MS || "30000", 10);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const requestStartTime = Date.now();
  const requestTimeIso = new Date().toISOString();

  console.log(`\n=======================================================`);
  console.log(`[LLM REQUEST] ${requestTimeIso}`);
  console.log(`  Model:      ${model}`);
  console.log(`  Category:   ${category}`);
  console.log(`  Difficulty: ${difficulty}`);
  console.log(`  Count:      ${count}`);
  console.log(`  Timeout:    ${timeoutMs}ms (${(timeoutMs / 1000).toFixed(1)}s)`);
  console.log(`  Endpoint:   ${baseUrl}/chat/completions`);
  console.log(`=======================================================`);

  try {
    const prompt = `Generate exactly ${count} multiple-choice English quiz questions.
Category: ${category === "Mixed English" ? "Mixed English (blend of Grammar, Vocabulary, Idioms, Prepositions, and Tenses)" : category}
Difficulty: ${difficulty}

CRITICAL RULES:
1. Provide exactly ${count} questions.
2. For each question, provide exactly 4 options.
3. "correctAnswer" must match one of the 4 options exactly.
4. IMPORTANT: Do NOT use unescaped double quotes inside question sentences or explanations. Use single quotes (') for any quoted words (e.g. He said 'hello').
5. Output valid JSON.

JSON format:
{
  "questions": [
    {
      "id": "q1",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "question": "Question text using 'single quotes' for quoted words...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation..."
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
            content: "You are an expert English educator and question writer. You create clear multiple-choice questions for English learners."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.5,
        top_p: 1,
        max_tokens: 3500,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const durationMs = Date.now() - requestStartTime;

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[LLM RESPONSE ERROR] Status: ${response.status} | Duration: ${durationMs}ms`);
      console.warn(`  Details: ${errText}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.warn(`[LLM RESPONSE ERROR] Empty content received | Duration: ${durationMs}ms`);
      return null;
    }

    // Apply multi-strategy parsing to extract questions from any response format
    const parsedQuestions = parseQuestionsFromAnyOutput(content, category, difficulty);

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
      console.warn(`[LLM RESPONSE PARSE ERROR] Could not extract valid questions from response | Duration: ${durationMs}ms`);
      console.warn(`  Preview of raw response: ${content.substring(0, 300)}...`);
      return null;
    }

    const finalQuestions = parsedQuestions.slice(0, count);

    console.log(`[LLM RESPONSE SUCCESS]`);
    console.log(`  Status:     ${response.status} OK`);
    console.log(`  Duration:   ${durationMs}ms (${(durationMs / 1000).toFixed(2)}s)`);
    console.log(`  Questions:  ${finalQuestions.length}`);
    if (data.usage) {
      console.log(`  Tokens:     Prompt: ${data.usage.prompt_tokens || 0} | Completion: ${data.usage.completion_tokens || 0} | Total: ${data.usage.total_tokens || 0}`);
    }
    console.log(`--- Generated Questions ---`);
    finalQuestions.forEach((q, idx) => {
      console.log(`  Q${idx + 1}: ${q.question}`);
    });
    console.log(`---------------------------\n`);

    return finalQuestions;

  } catch (error) {
    clearTimeout(timeoutId);
    const durationMs = Date.now() - requestStartTime;
    if (error.name === "AbortError") {
      console.warn(`[LLM REQUEST TIMEOUT] Request aborted after ${durationMs}ms. Using fallback bank.`);
    } else {
      console.warn(`[LLM REQUEST FAILED] Duration: ${durationMs}ms | Error: ${error.message}`);
    }
    return null;
  }
}
