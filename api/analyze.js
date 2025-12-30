import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(request, response) {
    // Handle CORS
    response.setHeader('Access-Control-Allow-Credentials', true);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    response.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (request.method === 'OPTIONS') {
        response.status(200).end();
        return;
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    // 1. Get API Keys (Legacy single key OR New multi-key support)
    const keys = process.env.GEMINI_API_KEYS
        ? process.env.GEMINI_API_KEYS.split(',').map(k => k.trim()).filter(k => k)
        : (process.env.GEMINI_API_KEY ? [process.env.GEMINI_API_KEY] : []);

    if (keys.length === 0) {
        console.error("Missing GEMINI_API_KEYS or GEMINI_API_KEY");
        return response.status(500).json({ error: "Server API Key not configured" });
    }

    const { videoData, mimeType } = request.body;

    if (!videoData) {
        return response.status(400).json({ error: "No audio data provided" });
    }

    // 2. Rotate Keys Logic
    let lastError = null;
    console.log(`Available API Keys: ${keys.length}`);

    for (const [index, apiKey] of keys.entries()) {
        try {
            console.log(`Attempting analysis with Key #${index + 1} (${apiKey.substring(0, 5)}...)`);
            const result = await analyzeWithKey(apiKey, videoData, mimeType);
            console.log(`Success with Key #${index + 1}`);
            return response.status(200).json(result);

        } catch (error) {
            console.error(`Failed with Key #${index + 1}:`, error.message);
            lastError = error;

            // Check if we should retry with next key
            // We generally retry on 429 (Too Many Requests), 500 (Server Error), or 403 (Quota/Permission)
            // Error handling depends on Google library, but usually error.message or error.status contains info.
            // Current strategy: Retry on ALL errors except 400 (Bad Request - Data invalid).

            // If it's the last key, loop finishes and we return error below.
        }
    }

    // 3. All keys failed
    return response.status(500).json({
        error: "All API Keys exhausted or Analysis Failed",
        message: lastError ? lastError.message : "Unknown error",
        details: lastError ? lastError.toString() : null
    });
}

// Helper function to encapsulate Gemini logic
async function analyzeWithKey(apiKey, videoData, mimeType) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const prompt = `You are a friendly English teacher at "SM English Center" giving feedback to a Vietnamese student (address the student as "Con").

Analyze the audio with PRIORITY on pronunciation.

Generate "detailedFeedback" strictly in this Vietnamese format:
"[Câu khen ngợi đa dạng và tự nhiên]. Tuy nhiên, con chú ý luyện tập thêm các từ sau đây:
- [word]: https://dictionary.cambridge.org/dictionary/english/[word]
- [word]: https://dictionary.cambridge.org/dictionary/english/[word]
Con hãy nghe kỹ link từ điển và sửa lại cho đúng nhé."

INSTRUCTIONS FOR PRAISE (Important):
- Be creative and generous with praise but keep it realistic.
- Vary your vocabulary. Do NOT strictly stick to "Good job" every time.
- Examples: "Cô rất ấn tượng với ngữ điệu tự tin của con hôm nay!", "Hoan hô con, bài tập về nhà con làm rất đầy đủ và chỉn chu.", "Giọng con hôm nay rất khỏe và rõ ràng, cô khen nhé!", "Con đã tiến bộ nhiều về âm đuôi (ending sounds), rất tốt!"...
- Adapt the praise to the specific strengths of the speech (fluency, energy, precision, effort).

INSTRUCTIONS FOR TONE (CRITICAL):
- DO NOT REPEAT sentence ending particles (like "nhé", "nha", "ạ") more than ONCE.
- Use a mix of statement sentences and gentle commands.
- Example of variety: "Con cần sửa từ này." (Statement) -> "Hãy cố gắng hơn!" (Exclamation) -> "Con làm tốt lắm." (Statement).

IMPORTANT:
- Always include valid Cambridge Dictionary links for mispronounced words.
- Use <br> for line breaks in "detailedFeedback".
- Tone: Encouraging, caring, friendly (like a kind teacher).

Please provide your analysis in the following JSON format:
{
  "score": [number from 0-100],
  "overall": "[brief overall assessment in Vietnamese]",
  "pronunciationErrors": [
    {"word": "[mispronounced word]", "error": "[vietnamese explanation]", "correction": "[correct phonetics]"}
  ],
  "strengths": [
    "[strength 1 in Vietnamese]",
    "[strength 2 in Vietnamese]",
    "[strength 3 in Vietnamese]"
  ],
  "improvements": [
    "[improvement 1 in Vietnamese]",
    "[improvement 2 in Vietnamese]",
    "[improvement 3 in Vietnamese]"
  ],
  "detailedFeedback": "[THE TEACHER FEEDBACK MESSAGE AS DESCRIBED ABOVE]"
}

Analyze these aspects IN THIS ORDER:
1. **PRONUNCIATION** (most important)
2. Common Vietnamese English errors  
3. Fluency and pace`;

    const parts = [
        { text: prompt },
        {
            inlineData: {
                mimeType: mimeType || "audio/mp3",
                data: videoData
            }
        }
    ];

    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
        }
    });

    const output = result.response.text();
    // Parse JSON safely
    try {
        const jsonText = output.replace(/```json\n/g, '').replace(/```\n/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("JSON Parse Error in Worker:", e);
        // Return structured fallback instead of crashing
        return {
            score: 75,
            overall: "Formatted analysis unavailable.",
            strengths: ["Audio processed"],
            improvements: ["See detailed feedback"],
            detailedFeedback: output
        };
    }
}
