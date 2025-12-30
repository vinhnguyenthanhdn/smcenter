// State Management
const state = {
    currentVideo: null,
    audioBlob: null,
    analysisResult: null
};

// DOM Elements
const elements = {
    // Upload Section
    videoInput: document.getElementById('videoInput'),
    dropzone: document.getElementById('dropzone'),
    uploadSection: document.getElementById('uploadSection'),
    videoPreview: document.getElementById('videoPreview'),
    previewVideo: document.getElementById('previewVideo'),
    videoName: document.getElementById('videoName'),
    videoDuration: document.getElementById('videoDuration'),
    analyzeBtn: document.getElementById('analyzeBtn'),

    // Processing Section
    processingSection: document.getElementById('processingSection'),
    processingTitle: document.getElementById('processingTitle'),
    processingDescription: document.getElementById('processingDescription'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    step1: document.getElementById('step1'),
    step2: document.getElementById('step2'),
    step3: document.getElementById('step3'),
    step4: document.getElementById('step4'),

    // Results Section
    resultsSection: document.getElementById('resultsSection'),
    scoreValue: document.getElementById('scoreValue'),
    scoreCircle: document.getElementById('scoreCircle'),
    scoreTitle: document.getElementById('scoreTitle'),
    scoreDescription: document.getElementById('scoreDescription'),
    strengthsList: document.getElementById('strengthsList'),
    improvementsList: document.getElementById('improvementsList'),
    detailedFeedback: document.getElementById('detailedFeedback'),
    newAnalysisBtn: document.getElementById('newAnalysisBtn')
};

// Initialize App
function init() {
    setupEventListeners();
}

// Event Listeners
function setupEventListeners() {
    // File Input
    elements.videoInput.addEventListener('change', handleFileSelect);

    // Drag and Drop
    elements.dropzone.addEventListener('dragover', handleDragOver);
    elements.dropzone.addEventListener('dragleave', handleDragLeave);
    elements.dropzone.addEventListener('drop', handleDrop);

    // Analyze Button
    elements.analyzeBtn.addEventListener('click', startAnalysis);

    // New Analysis Button
    elements.newAnalysisBtn.addEventListener('click', resetApp);
}

// File Selection Handlers
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        validateAndLoadVideo(file);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    elements.dropzone.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    elements.dropzone.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.dropzone.classList.remove('drag-over');

    const file = e.dataTransfer.files[0];
    if (file) {
        validateAndLoadVideo(file);
    }
}

// Validate and Load Video
function validateAndLoadVideo(file) {
    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
        alert('Please upload a video file');
        return;
    }

    // Check file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
        alert('File size must be less than 500MB');
        return;
    }

    state.currentVideo = file;

    // Create object URL for video preview
    const videoURL = URL.createObjectURL(file);
    elements.previewVideo.src = videoURL;
    elements.videoName.textContent = file.name;

    // Get video duration
    elements.previewVideo.addEventListener('loadedmetadata', () => {
        const duration = elements.previewVideo.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);

        elements.videoDuration.textContent = `Duration: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        elements.videoPreview.classList.remove('hidden');
    });
}

// Start Analysis
async function startAnalysis() {
    if (!state.apiKey) {
        showApiKeyModal();
        return;
    }

    if (!state.currentVideo) {
        alert('Please upload a video first');
        return;
    }

    // Show processing section
    showSection('processing');

    try {
        // Step 1: Upload (simulate)
        await updateProgress(1, 'Uploading', 'Preparing your video...', 25);
        await sleep(1000);

        // Step 2: Convert to audio
        await updateProgress(2, 'Converting', 'Extracting audio from video...', 50);
        await convertVideoToAudio();

        // Step 3: Analyze with Gemini
        await updateProgress(3, 'Analyzing', 'AI is analyzing your speech...', 75);
        await analyzeWithGemini();

        // Step 4: Finalize
        await updateProgress(4, 'Finalizing', 'Preparing your results...', 100);
        await sleep(1000);

        // Show results
        showSection('results');
        displayResults();

    } catch (error) {
        console.error('Analysis error:', error);
        alert('An error occurred during analysis. Please try again.');
        resetApp();
    }
}

// Update Progress
async function updateProgress(step, title, description, progress) {
    elements.processingTitle.textContent = title;
    elements.processingDescription.textContent = description;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `${progress}%`;

    // Update step states
    const steps = [elements.step1, elements.step2, elements.step3, elements.step4];
    steps.forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
            stepEl.classList.add('completed');
        } else if (index + 1 === step) {
            stepEl.classList.add('active');
        }
    });

    await sleep(500);
}

// Convert Video to Audio (Simplified - just prepare video for upload)
async function convertVideoToAudio() {
    // Gemini API now supports video directly, so we'll just prepare the video blob
    // This avoids MediaRecorder/AudioContext issues with file:// protocol
    return new Promise((resolve) => {
        // Simply store the video file as-is
        state.audioBlob = state.currentVideo;
        resolve();
    });
}

// Analyze with Gemini (via Server Proxy)
async function analyzeWithGemini() {
    try {
        // Convert video to base64
        const videoBase64 = await blobToBase64(state.currentVideo);

        // Call our server endpoint instead of Gemini directly
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                videoData: videoBase64.split(',')[1], // Remove data:video/... prefix
                mimeType: state.currentVideo.type || 'video/mp4'
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server error: ${response.status}`);
        }

        const analysisData = await response.json();
        state.analysisResult = analysisData;

    } catch (error) {
        console.error('Analysis error:', error);
        alert(`Analysis failed: ${error.message}\n\nPlease ensure the server has valid API key in .env file.`);
        throw error;
    }
}

// Helper function to extract list items from text
function extractListItems(text, keyword) {
    const items = [];
    const lines = text.split('\n');
    for (const line of lines) {
        if (line.toLowerCase().includes(keyword) && (line.includes('-') || line.includes('•'))) {
            const cleaned = line.replace(/^[-•*]\s*/, '').trim();
            if (cleaned) items.push(cleaned);
        }
    }
    return items.length > 0 ? items.slice(0, 3) : [`Analysis of ${keyword} aspects`];
}

// Demo Analysis (fallback)
function getDemoAnalysis() {
    return {
        score: 78,
        overall: "Good performance with strong content and clear delivery",
        strengths: [
            "Clear pronunciation and articulation of most words",
            "Good use of pauses and natural speech rhythm",
            "Strong vocabulary range and varied sentence structures"
        ],
        improvements: [
            "Reduce filler words (um, uh, like) for more professional delivery",
            "Work on intonation patterns to add more emotion and emphasis",
            "Improve eye contact and body language engagement"
        ],
        detailedFeedback: "Your English speech demonstrates a solid foundation with clear pronunciation and good vocabulary usage. Your content is well-organized and easy to follow. The pacing is generally appropriate, though there are moments where you could slow down for emphasis. Your grammar is strong with only minor errors. To enhance your delivery, focus on reducing filler words and incorporating more varied intonation patterns. Consider practicing your speech with more emotional expression to engage your audience better. Overall, this is a good performance that would benefit from refinement in delivery techniques."
    };
}

// Display Results
function displayResults() {
    const result = state.analysisResult;

    // Animate score
    animateScore(result.score);

    // Set score info
    let scoreCategory, scoreDesc;
    if (result.score >= 85) {
        scoreCategory = "Excellent Performance!";
        scoreDesc = "Your speech demonstrates excellent quality across all dimensions.";
    } else if (result.score >= 70) {
        scoreCategory = "Good Performance!";
        scoreDesc = result.overall || "Your speech shows good overall quality with some areas for improvement.";
    } else if (result.score >= 50) {
        scoreCategory = "Fair Performance";
        scoreDesc = result.overall || "Your speech is understandable but needs significant improvement.";
    } else {
        scoreCategory = "Needs Improvement";
        scoreDesc = result.overall || "Your speech requires substantial work in multiple areas.";
    }

    elements.scoreTitle.textContent = scoreCategory;
    elements.scoreDescription.textContent = scoreDesc;

    // Display pronunciation errors (if available)
    const pronunciationSection = document.getElementById('pronunciationSection');
    const pronunciationErrorsList = document.getElementById('pronunciationErrorsList');

    if (result.pronunciationErrors && result.pronunciationErrors.length > 0) {
        pronunciationSection.style.display = 'block';
        pronunciationErrorsList.innerHTML = '';

        result.pronunciationErrors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'pronunciation-error-item';
            errorDiv.innerHTML = `
                <div class="error-word"><strong>❌ "${error.word}"</strong></div>
                <div class="error-description">
                    <span class="error-label">Lỗi:</span> ${error.error}
                </div>
                <div class="error-correction">
                    <span class="correction-label">✅ Đúng:</span> ${error.correction}
                </div>
            `;
            pronunciationErrorsList.appendChild(errorDiv);
        });
    } else {
        pronunciationSection.style.display = 'none';
    }

    // Display strengths
    elements.strengthsList.innerHTML = '';
    result.strengths.forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        elements.strengthsList.appendChild(li);
    });

    // Display improvements
    elements.improvementsList.innerHTML = '';
    result.improvements.forEach(improvement => {
        const li = document.createElement('li');
        li.textContent = improvement;
        elements.improvementsList.appendChild(li);
    });

    // Display detailed feedback
    elements.detailedFeedback.textContent = result.detailedFeedback;
}

// Animate Score
function animateScore(targetScore) {
    const circumference = 2 * Math.PI * 85; // radius = 85
    const offset = circumference - (targetScore / 100) * circumference;

    // Animate the circle
    setTimeout(() => {
        elements.scoreCircle.style.strokeDashoffset = offset;
    }, 100);

    // Animate the number
    let currentScore = 0;
    const increment = targetScore / 50; // 50 frames
    const timer = setInterval(() => {
        currentScore += increment;
        if (currentScore >= targetScore) {
            currentScore = targetScore;
            clearInterval(timer);
        }
        elements.scoreValue.textContent = Math.round(currentScore);
    }, 20);

    // Add gradient definition to SVG
    const svg = elements.scoreCircle.closest('svg');
    if (!svg.querySelector('#scoreGradient')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.id = 'scoreGradient';
        gradient.innerHTML = `
            <stop offset="0%" stop-color="hsl(260, 100%, 65%)" />
            <stop offset="100%" stop-color="hsl(340, 100%, 65%)" />
        `;
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }
}

// Section Management
function showSection(section) {
    elements.uploadSection.classList.add('hidden');
    elements.processingSection.classList.add('hidden');
    elements.resultsSection.classList.add('hidden');

    switch (section) {
        case 'upload':
            elements.uploadSection.classList.remove('hidden');
            break;
        case 'processing':
            elements.processingSection.classList.remove('hidden');
            break;
        case 'results':
            elements.resultsSection.classList.remove('hidden');
            break;
    }
}

// Reset App
function resetApp() {
    state.currentVideo = null;
    state.audioBlob = null;
    state.analysisResult = null;

    elements.videoInput.value = '';
    elements.previewVideo.src = '';
    elements.videoPreview.classList.add('hidden');
    elements.progressFill.style.width = '0%';
    elements.scoreCircle.style.strokeDashoffset = 534;

    showSection('upload');
}

// Utility Functions
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
