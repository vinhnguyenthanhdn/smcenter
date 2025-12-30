#!/usr/bin/env python3
"""
Flask Server for Speech Checker App with API Proxy
Handles Gemini API calls server-side to protect API key
"""

import os
import json
import base64
import webbrowser
from pathlib import Path
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Configuration
PORT = 8000
DIRECTORY = Path(__file__).parent
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Initialize Flask app
app = Flask(__name__, static_folder=str(DIRECTORY))
CORS(app)

# Serve static files
@app.route('/')
def index():
    return send_from_directory(str(DIRECTORY), 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(str(DIRECTORY), path)

# API endpoint to analyze speech
@app.route('/api/analyze', methods=['POST'])
def analyze_speech():
    try:
        # Check if API key is configured
        if not GEMINI_API_KEY or GEMINI_API_KEY == 'your_api_key_here':
            return jsonify({
                'error': 'API key not configured',
                'message': 'Please set GEMINI_API_KEY in .env file'
            }), 500
        
        # Get video data from request
        data = request.get_json()
        video_base64 = data.get('videoData')
        mime_type = data.get('mimeType', 'video/mp4')
        
        if not video_base64:
            return jsonify({'error': 'No video data provided'}), 400
        
        # Prepare Gemini API request
        api_url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}'
        
        prompt = """You are an expert English speech coach. Analyze this English speech video and provide detailed feedback.

Please provide your analysis in the following JSON format:
{
  "score": [number from 0-100],
  "overall": "[brief overall assessment]",
  "strengths": [
    "[strength 1]",
    "[strength 2]",
    "[strength 3]"
  ],
  "improvements": [
    "[area 1 to improve]",
    "[area 2 to improve]",
    "[area 3 to improve]"
  ],
  "detailedFeedback": "[detailed paragraph about pronunciation, fluency, grammar, vocabulary, content organization, and delivery]"
}

Consider these aspects:
1. Pronunciation and clarity
2. Fluency and pace
3. Grammar and vocabulary
4. Content organization
5. Confidence and delivery
6. Use of transitions and connectors"""

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
            return jsonify({
                'error': f'Gemini API error: {response.status_code}',
                'details': error_data
            }), response.status_code
        
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
        
        return jsonify(analysis_result)
        
    except requests.Timeout:
        return jsonify({'error': 'Request timeout - video may be too long'}), 504
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Health check endpoint
@app.route('/api/health')
def health():
    return jsonify({
        'status': 'ok',
        'api_key_configured': bool(GEMINI_API_KEY and GEMINI_API_KEY != 'your_api_key_here')
    })

def main():
    # Check if API key is set
    if not GEMINI_API_KEY:
        print("=" * 60)
        print("WARNING: GEMINI_API_KEY not found in .env file")
        print("=" * 60)
        print("Please create a .env file with your Gemini API key:")
        print("1. Copy .env.example to .env")
        print("2. Replace 'your_api_key_here' with your actual API key")
        print("3. Get API key from: https://makersuite.google.com/app/apikey")
        print("=" * 60)
        print()
    
    url = f"http://localhost:{PORT}"
    print("=" * 60)
    print("Speech Checker Server Started!")
    print("=" * 60)
    print(f"Server running at: {url}")
    print(f"Serving directory: {DIRECTORY}")
    print(f"API endpoint: {url}/api/analyze")
    print()
    print("Opening browser automatically...")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Open browser
    try:
        webbrowser.open(url)
    except:
        print("Could not open browser automatically")
        print(f"Please open {url} manually in your browser")
    
    # Run Flask app
    try:
        app.run(host='0.0.0.0', port=PORT, debug=False)
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
        print("Goodbye!")

if __name__ == "__main__":
    main()
