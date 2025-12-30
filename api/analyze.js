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

    // Check if API Key is configured
    if (!process.env.GEMINI_API_KEY) {
        console.error("Missing GEMINI_API_KEY");
        return response.status(500).json({ error: "Server API Key not configured" });
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { videoData, mimeType } = request.body;

        if (!videoData) {
            return response.status(400).json({ error: "No audio data provided" });
        }

        console.log("Initializing Gemini 1.5 Pro...");

        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Switch to gemini-1.5-flash-latest (more widely available/stable than flash sometimes)
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `You are a friendly English teacher at "SM English Center" giving feedback to a Vietnamese student (address the student as "Con").

Analyze the audio with PRIORITY on pronunciation.

Generate "detailedFeedback" strictly in this Vietnamese format:
"[Câu khen ngợi đa dạng và tự nhiên]. Tuy nhiên, con chú ý chỉnh lại một vài từ sau để phát âm chuẩn hơn:
- [word]: https://dictionary.cambridge.org/dictionary/english/[word]
- [word]: https://dictionary.cambridge.org/dictionary/english/[word]
Con hãy nghe link từ điển và luyện tập lại nha."

INSTRUCTIONS FOR PRAISE (Important):
- Be creative and generous with praise but keep it realistic.
- Vary your vocabulary. Do NOT strictly stick to "Good job" every time.
- Examples: "Cô rất ấn tượng với ngữ điệu tự tin của con hôm nay!", "Hoan hô con, bài tập về nhà con làm rất đầy đủ và chỉn chu.", "Giọng con hôm nay rất khỏe và rõ ràng, cô khen nhé!", "Con đã tiến bộ nhiều về âm đuôi (ending sounds), rất tốt!"...
- Adapt the praise to the specific strengths of the speech (fluency, energy, precision, effort).

INSTRUCTIONS FOR TONE:
- Avoid overusing the word "nhé" at the end of every sentence.
- Use variety: "nha", "đi nào", "cố gắng lên", or simple gentle statements.

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

        // Prepare content parts
        const parts = [
            { text: prompt },
            {
                inlineData: {
                    mimeType: mimeType || "audio/mp3",
                    data: videoData
                }
            }
        ];

        console.log("Sending request to Gemini...");

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048
            }
        });

        const output = result.response.text();
        console.log("Gemini response length:", output.length);

        // Parse JSON safely
        let analysisResult;
        try {
            const jsonText = output.replace(/```json\n/g, '').replace(/```\n/g, '').replace(/```/g, '').trim();
            analysisResult = JSON.parse(jsonText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback
            analysisResult = {
                score: 75,
                overall: "Formatted analysis unavailable.",
                strengths: ["Audio processed"],
                improvements: ["See detailed feedback"],
                detailedFeedback: output
            };
        }

        return response.status(200).json(analysisResult);

    } catch (error) {
        console.error("Gemini API Error:", error);
        // Return detailed error to help debugging
        return response.status(500).json({
            error: "AI Analysis Failed",
            message: error.message,
            details: error.toString()
        });
    }
}
