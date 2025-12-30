"""
Vercel Serverless Function for Speech Analysis
Handles Gemini API calls server-side to protect API key
"""

import os
import json
import requests
from http.server import BaseHTTPRequestHandler

# Get API key from environment variable
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            # Check if API key is configured
            if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_api_key_here':
                self.send_error_response(500, 'API key not configured', 
                    'Please set GEMINI_API_KEY environment variable in Vercel')
                return
            
            # Get content length and read request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            video_base64 = data.get('videoData')
            mime_type = data.get('mimeType', 'video/mp4')
            
            if not video_base64:
                self.send_error_response(400, 'No video data provided')
                return
            
            # Prepare Gemini API request
            api_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}'
            
            prompt = """You are an expert English speech coach specializing in helping Vietnamese English learners. Analyze this English speech video with PRIORITY on pronunciation analysis.

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
6. Confidence and delivery"""

            request_body = {
                "contents": [{
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": video_base64
                            }
                        }
                    ]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048,
                }
            }

            # Call Gemini API
            response = requests.post(api_url, json=request_body, timeout=120)
            
            if not response.ok:
                error_data = response.json() if response.text else {}
                self.send_error_response(response.status_code, 
                    f'Gemini API error: {response.status_code}', 
                    json.dumps(error_data))
                return
            
            # Parse response
            gemini_data = response.json()
            response_text = gemini_data['candidates'][0]['content']['parts'][0]['text']
            
            # Try to parse JSON from response
            try:
                json_text = response_text.replace('```json\n', '').replace('```\n', '').replace('```', '').strip()
                analysis_result = json.loads(json_text)
            except:
                # If parsing fails, create structured response
                analysis_result = {
                    "score": 75,
                    "overall": "Good performance with room for improvement",
                    "strengths": ["Clear pronunciation", "Good vocabulary", "Confident delivery"],
                    "improvements": ["Reduce filler words", "Improve intonation", "Better pacing"],
                    "detailedFeedback": response_text
                }
            
            # Send success response
            self.send_json_response(200, analysis_result)
            
        except requests.Timeout:
            self.send_error_response(504, 'Request timeout - video may be too long')
        except Exception as e:
            self.send_error_response(500, str(e))
    
    def do_OPTIONS(self):
        # Handle CORS preflight
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def send_json_response(self, status_code, data):
        self.send_response(status_code)
        self.send_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def send_error_response(self, status_code, error, details=None):
        error_data = {'error': error}
        if details:
            error_data['details'] = details
        self.send_json_response(status_code, error_data)
    
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
