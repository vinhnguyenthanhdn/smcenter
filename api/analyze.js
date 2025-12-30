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
        return response.status(500).json({ error: "Server API Key not configured inside Vercel" });
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { videoData, mimeType } = request.body;

        if (!videoData) {
            return response.status(400).json({ error: "No audio data provided" });
        }

        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are an expert English speech coach specializing in helping Vietnamese English learners. Analyze this English speech audio with PRIORITY on pronunciation analysis.

IMPORTANT: Focus on common Vietnamese pronunciation errors:
- Confusing "th" sounds with "s" or "t" (think → sink/tink)
- Confusing "v" with "w" or "f" (very → wery)
- Missing final consonants (stop → sto, want → wan)
- Confusing short/long vowels (hit vs heat, full vs fool)
- Word stress patterns
- Sentence intonation

Please provide your analysis in the following JSON format:
{
  "score": [number from 0-100],
  "overall": "[brief overall assessment]",
  "pronunciationErrors": [
    {"word": "[mispronounced word]", "error": "[what's wrong]", "correction": "[how to say it correctly]"},
    {"word": "[word 2]", "error": "[error type]", "correction": "[correct pronunciation]"}
  ],
  "strengths": [
    "[strength 1]",
    "[strength 2]",
    "[strength 3]"
  ],
  "improvements": [
    "[area 1 to improve - PRIORITIZE pronunciation issues]",
    "[area 2 to improve]",
    "[area 3 to improve]"
  ],
  "detailedFeedback": "[detailed paragraph focusing on: 1) Specific pronunciation mistakes (list words), 2) Vietnamese accent features to improve, 3) Grammar and vocabulary, 4) Fluency and delivery]"
}

Analyze these aspects IN THIS ORDER:
1. **PRONUNCIATION** (most important) - List specific mispronounced words
2. Common Vietnamese English errors  
3. Fluency and pace
4. Grammar and vocabulary
5. Content organization
6. Confidence and delivery`;

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

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
                responseMimeType: "application/json"
            }
        });

        const output = result.response.text();

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
        return response.status(500).json({
            error: "AI Analysis Failed",
            details: error.message
        });
    }
}
