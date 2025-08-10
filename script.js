// Global state
let currentChallenge = null;
let challengeHistory = [];
let apiKey = null;
let isGenerating = false;

// DOM elements
const elements = {
    // Modal
    apiKeyModal: document.getElementById('apiKeyModal'),
    apiKeyInput: document.getElementById('apiKeyInput'),
    apiKeyError: document.getElementById('apiKeyError'),
    saveApiKey: document.getElementById('saveApiKey'),
    changeApiKey: document.getElementById('changeApiKey'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle'),
    
    // Tabs
    tabTriggers: document.querySelectorAll('.tab-trigger'),
    challengeTab: document.getElementById('challengeTab'),
    historyTab: document.getElementById('historyTab'),
    
    // Challenge sections
    welcomeSection: document.getElementById('welcomeSection'),
    loadingGhost: document.getElementById('loadingGhost'),
    rateLimitWarning: document.getElementById('rateLimitWarning'),
    generationError: document.getElementById('generationError'),
    challengeControls: document.getElementById('challengeControls'),
    currentChallenge: document.getElementById('currentChallenge'),
    
    // Controls
    difficultySelect: document.getElementById('difficultySelect'),
    languageSelect: document.getElementById('languageSelect'),
    generateChallenge: document.getElementById('generateChallenge'),
    languageDisplay: document.getElementById('languageDisplay'),
    languageText: document.getElementById('languageText'),
    difficultyText: document.getElementById('difficultyText'),
    apiKeyRequired: document.getElementById('apiKeyRequired'),
    
    // Challenge display
    challengeLanguageIcon: document.getElementById('challengeLanguageIcon'),
    challengeLanguage: document.getElementById('challengeLanguage'),
    challengeDifficulty: document.getElementById('challengeDifficulty'),
    challengeProblem: document.getElementById('challengeProblem'),
    codeDisplay: document.getElementById('codeDisplay'),
    codeExplanation: document.getElementById('codeExplanation'),
    htmlPreview: document.getElementById('htmlPreview'),
    previewFrame: document.getElementById('previewFrame'),
    expandPreview: document.getElementById('expandPreview'),
    
    // Answer section
    answerButtons: document.getElementById('answerButtons'),
    correctBtn: document.getElementById('correctBtn'),
    incorrectBtn: document.getElementById('incorrectBtn'),
    answerReveal: document.getElementById('answerReveal'),
    userResult: document.getElementById('userResult'),
    resultIcon: document.getElementById('resultIcon'),
    resultText: document.getElementById('resultText'),
    userAnswerBadge: document.getElementById('userAnswerBadge'),
    actualAnswerBadge: document.getElementById('actualAnswerBadge'),
    explanationTitle: document.getElementById('explanationTitle'),
    explanationText: document.getElementById('explanationText'),
    additionalInfo: document.getElementById('additionalInfo'),
    additionalInfoText: document.getElementById('additionalInfoText'),
    
    // History
    statsCard: document.getElementById('statsCard'),
    totalChallenges: document.getElementById('totalChallenges'),
    accuracyPercent: document.getElementById('accuracyPercent'),
    correctAnswers: document.getElementById('correctAnswers'),
    incorrectAnswers: document.getElementById('incorrectAnswers'),
    easyCount: document.getElementById('easyCount'),
    mediumCount: document.getElementById('mediumCount'),
    hardCount: document.getElementById('hardCount'),
    jsCount: document.getElementById('jsCount'),
    htmlCount: document.getElementById('htmlCount'),
    cssCount: document.getElementById('cssCount'),
    historyList: document.getElementById('historyList'),
    emptyHistory: document.getElementById('emptyHistory'),
    
    // Status elements
    generationTime: document.getElementById('generationTime'),
    errorTime: document.getElementById('errorTime'),
    errorTitle: document.getElementById('errorTitle'),
    errorMessage: document.getElementById('errorMessage')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeLucideIcons();
    loadSavedData();
    setupEventListeners();
    updateUI();
});

// Initialize Lucide icons
function initializeLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Load saved data from localStorage
function loadSavedData() {
    // Load challenge history
    const savedHistory = localStorage.getItem('codeleap-history');
    if (savedHistory) {
        challengeHistory = JSON.parse(savedHistory);
    }
    
    // Load API key or set default
    const savedApiKey = localStorage.getItem('codeleap-api-key');
    if (savedApiKey) {
        apiKey = savedApiKey;
    } else {
        // Set default Groq API key
        const defaultKey = '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';
        apiKey = defaultKey;
        localStorage.setItem('codeleap-api-key', defaultKey);
    }
    
    // Load theme
    const savedTheme = localStorage.getItem('codeleap-theme') || 'light';
    document.body.className = `${savedTheme}-theme`;
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Tabs
    elements.tabTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Controls
    elements.difficultySelect.addEventListener('change', updateControlLabels);
    elements.languageSelect.addEventListener('change', updateControlLabels);
    elements.generateChallenge.addEventListener('click', generateChallengeHandler);
    
    // Answer buttons
    elements.correctBtn.addEventListener('click', () => handleAnswer(true));
    elements.incorrectBtn.addEventListener('click', () => handleAnswer(false));
    
    // Preview expand
    if (elements.expandPreview) {
        elements.expandPreview.addEventListener('click', togglePreviewExpand);
    }
}

// Theme functions
function toggleTheme() {
    const currentTheme = document.body.className.includes('dark') ? 'dark' : 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.className = `${newTheme}-theme`;
    localStorage.setItem('codeleap-theme', newTheme);
    
    // Update theme toggle icons
    const sunIcon = elements.themeToggle.querySelector('.sun-icon');
    const moonIcon = elements.themeToggle.querySelector('.moon-icon');
    
    if (newTheme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    }
}

// Tab functions
function switchTab(tabName) {
    // Update tab triggers
    elements.tabTriggers.forEach(trigger => {
        trigger.classList.toggle('active', trigger.dataset.tab === tabName);
    });
    
    // Update tab content
    elements.challengeTab.classList.toggle('active', tabName === 'challenge');
    elements.historyTab.classList.toggle('active', tabName === 'history');
    
    // Update history when switching to history tab
    if (tabName === 'history') {
        updateHistoryDisplay();
    }
}

// Control functions
function updateControlLabels() {
    const difficulty = elements.difficultySelect.value;
    const language = elements.languageSelect.value;
    
    elements.languageDisplay.textContent = language.toUpperCase();
    elements.languageText.textContent = language;
    elements.difficultyText.textContent = difficulty;
}

// Challenge generation
async function generateChallengeHandler() {
    if (!apiKey) {
        console.error('No API key available');
        return;
    }
    
    if (isGenerating) return;
    
    const difficulty = elements.difficultySelect.value;
    const language = elements.languageSelect.value;
    
    await generateChallenge(difficulty, language);
}

async function generateChallenge(difficulty, language) {
    const startTime = Date.now();
    isGenerating = true;
    
    // Show loading state
    showLoadingState();
    
    try {
        const response = await fetch('/api/generate-challenge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                difficulty: difficulty,
                language: language,
                apiKey: apiKey
            })
        });
        
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const challenge = await response.json();
        
        // Handle different response types
        if (challenge.isRateLimit) {
            showRateLimitWarning(generationTime);
        } else if (challenge.fallbackUsed) {
            showGenerationError('AI was slow/unavailable, using curated challenge', generationTime, true);
        }
        
        // Display the challenge
        currentChallenge = {
            ...challenge,
            id: challenge.id || `challenge-${Date.now()}`,
            timestamp: challenge.timestamp || Date.now()
        };
        
        displayChallenge(currentChallenge);
        
    } catch (error) {
        const endTime = Date.now();
        const generationTime = endTime - startTime;
        
        console.error('Challenge generation failed:', error);
        showGenerationError(error.message || 'Generation failed', generationTime, false);
        
        // Show dynamic fallback challenge
        currentChallenge = getDynamicFallbackChallenge(language, difficulty);
        displayChallenge(currentChallenge);
    } finally {
        isGenerating = false;
        hideLoadingState();
    }
}

async function callGroqAPI(difficulty, language) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, 30000); // 30 second timeout
    
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "llama-3.1-8b-instant",
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an expert programming instructor who creates educational coding challenges. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": createPrompt(language, difficulty)
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 2000,
                "top_p": 0.9
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorText = await response.text();
            
            if (response.status === 429 || errorText.includes('Rate limit exceeded')) {
                throw new Error('RATE_LIMIT_EXCEEDED');
            }
            
            throw new Error(`Groq API error (${response.status}): ${errorText}`);
        }
        
        const aiResponse = await response.json();
        const content = aiResponse.choices?.[0]?.message?.content;
        
        if (!content) {
            throw new Error('No content received from AI');
        }
        
        // Parse the JSON response
        const challenge = parseAIResponse(content, language, difficulty);
        
        return {
            ...challenge,
            id: `ai-${language}-${difficulty}-${Date.now()}`,
            language,
            difficulty,
            timestamp: Date.now()
        };
        
    } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
    }
}

function createPrompt(language, difficulty) {
    const topics = {
        javascript: {
            easy: ['variables and data types', 'basic functions', 'arrays', 'simple objects', 'for loops', 'if statements'],
            medium: ['array methods', 'arrow functions', 'promises', 'destructuring', 'classes', 'async/await'],
            hard: ['closures', 'prototypes', 'recursion', 'higher-order functions', 'generators', 'design patterns']
        },
        html: {
            easy: ['headings and paragraphs', 'links', 'images', 'lists', 'basic elements'],
            medium: ['forms', 'tables', 'semantic elements', 'input types', 'attributes'],
            hard: ['accessibility', 'meta tags', 'custom elements', 'microdata', 'web components']
        },
        css: {
            easy: ['colors and fonts', 'margins and padding', 'borders', 'basic selectors'],
            medium: ['flexbox', 'grid', 'positioning', 'transitions', 'media queries'],
            hard: ['animations', 'custom properties', 'advanced selectors', 'performance']
        }
    };
    
    const topicList = topics[language][difficulty];
    const randomTopic = topicList[Math.floor(Math.random() * topicList.length)];
    const shouldBeCorrect = Math.random() > 0.6;
    const scenario = Math.floor(Math.random() * 10000);
    
    const complexityInstructions = {
        easy: 'Keep it simple and beginner-friendly',
        medium: 'Include intermediate concepts',
        hard: 'Use advanced concepts and patterns'
    };
    
    return `Create a unique ${difficulty} ${language} challenge about "${randomTopic}". Scenario #${scenario}.

${complexityInstructions[difficulty]}. Make it educational and realistic.

Return ONLY a valid JSON object:
{
  "problem": "Is this ${language} code correct?",
  "code": "your_code_here",
  "codeExplanation": "Brief explanation",
  "isCorrect": ${shouldBeCorrect},
  "explanation": "Detailed explanation",
  "additionalInfo": "Learning tip"
}

Rules:
- Use \\n for line breaks
- Escape quotes with \\"
- Focus on "${randomTopic}"
- ${shouldBeCorrect ? 'Make code completely valid' : 'Include ONE realistic error'}
- Use proper indentation
- Make it practical and educational`;
}

function parseAIResponse(content, language, difficulty) {
    try {
        let cleanContent = content.trim()
            .replace(/\`\`\`json\s*/gi, '')
            .replace(/\`\`\`\s*/g, '')
            .replace(/^[^{]*/, '')
            .replace(/[^}]*$/, '')
            .trim();
        
        const challenge = JSON.parse(cleanContent);
        
        if (!challenge.problem || !challenge.code || typeof challenge.isCorrect !== 'boolean') {
            throw new Error('Missing required fields');
        }
        
        // Clean the code
        let cleanCode = challenge.code
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '  ')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/\\\\/g, '\\');
        
        return {
            problem: challenge.problem,
            code: cleanCode,
            codeExplanation: challenge.codeExplanation || `This ${language} code demonstrates key concepts.`,
            isCorrect: challenge.isCorrect,
            explanation: challenge.explanation || `This code is ${challenge.isCorrect ? 'correct' : 'incorrect'}.`,
            additionalInfo: challenge.additionalInfo || `This is a ${difficulty} ${language} example.`
        };
        
    } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        throw new Error('Failed to parse AI response');
    }
}

// Dynamic fallback challenge generation
function getDynamicFallbackChallenge(language, difficulty) {
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);
    
    if (language === 'javascript') {
        return generateJavaScriptChallenge(difficulty, randomSeed, timestamp);
    } else if (language === 'html') {
        return generateHTMLChallenge(difficulty, randomSeed, timestamp);
    } else if (language === 'css') {
        return generateCSSChallenge(difficulty, randomSeed, timestamp);
    }
    
    return {
        problem: `Is this ${language} code correct?`,
        code: `// ${language} example\nconsole.log("Hello World");`,
        codeExplanation: `Basic ${language} example.`,
        isCorrect: true,
        explanation: `This code is syntactically correct.`,
        additionalInfo: `This demonstrates basic ${language} syntax.`,
        id: `fallback-${language}-${difficulty}-${timestamp}`,
        language,
        difficulty,
        timestamp
    };
}

function generateJavaScriptChallenge(difficulty, seed, timestamp) {
    const challenges = {
        easy: [
            {
                code: `let count = 0;\nfor (let i = 1; i <= 5; i++) {\n  count += i;\n}\nconsole.log(count);`,
                correct: true,
                explanation: 'This correctly calculates the sum of numbers 1 through 5 using a for loop.'
            },
            {
                code: `function multiply(a, b) {\n  return a * b\n}\n\nconst result = multiply(4, 5);\nconsole.log(result);`,
                correct: false,
                explanation: 'Missing semicolon after the return statement. Should be: return a * b;'
            }
        ],
        medium: [
            {
                code: `const users = [{name: "Alice", age: 25}, {name: "Bob", age: 30}];\nconst names = users.map(user => user.name);\nconsole.log(names);`,
                correct: true,
                explanation: 'This correctly uses the map method to extract names from an array of objects.'
            },
            {
                code: `async function getData() {\n  const response = await fetch("/api/data");\n  const data = response.json();\n  return data;\n}`,
                correct: false,
                explanation: 'Missing await before response.json(). Should be: const data = await response.json();'
            }
        ],
        hard: [
            {
                code: `function memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) {\n      return cache.get(key);\n    }\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}`,
                correct: true,
                explanation: 'This correctly implements a memoization function using closures and a Map for caching.'
            }
        ]
    };
    
    const diffChallenges = challenges[difficulty] || challenges.easy;
    const selected = diffChallenges[seed % diffChallenges.length];
    
    return {
        problem: 'Is this JavaScript code correct?',
        code: selected.code,
        codeExplanation: `This JavaScript demonstrates ${difficulty}-level programming concepts.`,
        isCorrect: selected.correct,
        explanation: selected.explanation,
        additionalInfo: `Understanding these ${difficulty} JavaScript concepts is important for development.`,
        id: `fallback-javascript-${difficulty}-${timestamp}`,
        language: 'javascript',
        difficulty,
        timestamp
    };
}

function generateHTMLChallenge(difficulty, seed, timestamp) {
    const challenges = {
        easy: [
            {
                code: `<div class="card">\n  <h2>Welcome</h2>\n  <p>This is a simple card component.</p>\n  <button>Click me</button>\n</div>`,
                correct: true,
                explanation: 'This HTML is properly structured with correct nesting and semantic elements.'
            },
            {
                code: `<ul>\n  <li>Item 1</li>\n  <li>Item 2\n  <li>Item 3</li>\n</ul>`,
                correct: false,
                explanation: 'Missing closing </li> tag for "Item 2". Each list item must be properly closed.'
            }
        ],
        medium: [
            {
                code: `<form>\n  <label for="username">Username:</label>\n  <input type="text" id="username" name="username" required>\n  <label for="password">Password:</label>\n  <input type="password" id="password" name="password" required>\n  <button type="submit">Login</button>\n</form>`,
                correct: true,
                explanation: 'This form is properly structured with labels correctly associated with inputs for accessibility.'
            }
        ],
        hard: [
            {
                code: `<article>\n  <header>\n    <h1>Article Title</h1>\n    <time datetime="2024-01-15">January 15, 2024</time>\n  </header>\n  <section>\n    <p>Article content goes here.</p>\n  </section>\n</article>`,
                correct: true,
                explanation: 'This uses semantic HTML5 elements correctly to structure an article with proper hierarchy.'
            }
        ]
    };
    
    const diffChallenges = challenges[difficulty] || challenges.easy;
    const selected = diffChallenges[seed % diffChallenges.length];
    
    return {
        problem: 'Is this HTML code correct?',
        code: selected.code,
        codeExplanation: `This HTML demonstrates ${difficulty}-level markup concepts.`,
        isCorrect: selected.correct,
        explanation: selected.explanation,
        additionalInfo: `Proper HTML structure is essential for ${difficulty} web development.`,
        id: `fallback-html-${difficulty}-${timestamp}`,
        language: 'html',
        difficulty,
        timestamp
    };
}

function generateCSSChallenge(difficulty, seed, timestamp) {
    const challenges = {
        easy: [
            {
                code: `.button {\n  background-color: #007bff;\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n}`,
                correct: true,
                explanation: 'This CSS correctly styles a button with proper syntax and semicolons.'
            },
            {
                code: `.card {\n  background-color: #f8f9fa\n  padding: 20px;\n  border-radius: 8px;\n  box-shadow: 0 2px 4px rgba(0,0,0,0.1);\n}`,
                correct: false,
                explanation: 'Missing semicolon after background-color property. Should be: background-color: #f8f9fa;'
            }
        ],
        medium: [
            {
                code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  gap: 20px;\n}`,
                correct: true,
                explanation: 'This correctly uses flexbox to center content both horizontally and vertically.'
            }
        ],
        hard: [
            {
                code: `@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to { opacity: 1; transform: translateY(0); }\n}\n\n.animate {\n  animation: fadeIn 0.3s ease-out;\n}`,
                correct: true,
                explanation: 'This correctly defines a CSS animation with keyframes for a fade-in effect.'
            }
        ]
    };
    
    const diffChallenges = challenges[difficulty] || challenges.easy;
    const selected = diffChallenges[seed % diffChallenges.length];
    
    return {
        problem: 'Is this CSS code correct?',
        code: selected.code,
        codeExplanation: `This CSS demonstrates ${difficulty}-level styling concepts.`,
        isCorrect: selected.correct,
        explanation: selected.explanation,
        additionalInfo: `Mastering ${difficulty} CSS concepts is important for modern web design.`,
        id: `fallback-css-${difficulty}-${timestamp}`,
        language: 'css',
        difficulty,
        timestamp
    };
}

// UI State functions
function showLoadingState() {
    elements.welcomeSection.classList.add('hidden');
    elements.rateLimitWarning.classList.add('hidden');
    elements.generationError.classList.add('hidden');
    elements.currentChallenge.classList.add('hidden');
    elements.loadingGhost.classList.remove('hidden');
    
    elements.generateChallenge.disabled = true;
    elements.generateChallenge.innerHTML = '<i data-lucide="brain"></i> AI is thinking...';
    initializeLucideIcons();
}

function hideLoadingState() {
    elements.loadingGhost.classList.add('hidden');
    elements.generateChallenge.disabled = false;
    elements.generateChallenge.innerHTML = '<i data-lucide="brain"></i> Generate Challenge';
    initializeLucideIcons();
}

function showRateLimitWarning(generationTime) {
    elements.rateLimitWarning.classList.remove('hidden');
    elements.generationError.classList.add('hidden');
    
    if (generationTime && elements.generationTime) {
        elements.generationTime.classList.remove('hidden');
        elements.generationTime.querySelector('span').textContent = `${(generationTime / 1000).toFixed(1)}s`;
    }
}

function showGenerationError(message, generationTime, isFallback) {
    elements.generationError.classList.remove('hidden');
    elements.rateLimitWarning.classList.add('hidden');
    
    elements.errorTitle.textContent = isFallback ? 'Using Curated Challenge' : 'AI Issue';
    elements.errorMessage.textContent = message;
    
    const errorCard = elements.generationError;
    if (isFallback) {
        errorCard.className = 'card warning-card';
    } else {
        errorCard.className = 'card error-card';
    }
    
    if (generationTime && elements.errorTime) {
        elements.errorTime.classList.remove('hidden');
        elements.errorTime.querySelector('span').textContent = `${(generationTime / 1000).toFixed(1)}s`;
    }
}

// Challenge display
function displayChallenge(challenge) {
    elements.welcomeSection.classList.add('hidden');
    elements.currentChallenge.classList.remove('hidden');
    
    // Update challenge info
    const languageIcons = {
        javascript: '🟨',
        html: '🟧',
        css: '🟦'
    };
    
    elements.challengeLanguageIcon.textContent = languageIcons[challenge.language];
    elements.challengeLanguage.textContent = challenge.language.charAt(0).toUpperCase() + challenge.language.slice(1);
    elements.challengeDifficulty.textContent = challenge.difficulty.toUpperCase();
    elements.challengeDifficulty.className = `difficulty-badge ${challenge.difficulty}`;
    elements.challengeProblem.textContent = challenge.problem;
    
    // Display code
    displayCode(challenge.code, challenge.language);
    
    // Update explanation
    elements.codeExplanation.textContent = challenge.codeExplanation;
    
    // Show HTML preview if applicable
    if (challenge.language === 'html' && shouldShowPreview(challenge.code)) {
        showHtmlPreview(challenge.code);
    } else {
        elements.htmlPreview.classList.add('hidden');
    }
    
    // Reset answer state
    elements.answerButtons.classList.remove('hidden');
    elements.answerReveal.classList.add('hidden');
    
    initializeLucideIcons();
}

function displayCode(code, language) {
    const formattedCode = formatCode(code, language);
    const lines = formattedCode.split('\n');
    
    let html = `
        <div class="code-header">
            <span class="code-language">${language.toUpperCase()}</span>
        </div>
        <div class="code-content">
    `;
    
    lines.forEach((line, index) => {
        const escapedLine = escapeHtml(line) || '&nbsp;';
        html += `
            <div class="code-line">
                <span class="line-number">${index + 1}</span>
                <span class="line-content">${escapedLine}</span>
            </div>
        `;
    });
    
    html += '</div>';
    elements.codeDisplay.innerHTML = html;
}

function formatCode(code, language) {
    if (language === 'html') {
        return formatHTML(code);
    } else if (language === 'css') {
        return formatCSS(code);
    } else if (language === 'javascript') {
        return formatJavaScript(code);
    }
    return code;
}

function formatHTML(html) {
    if (!html || html.trim().length === 0) return html;
    
    let formatted = '';
    let indent = 0;
    const indentSize = 2;
    
    let cleanHtml = html
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
    
    const parts = cleanHtml.split(/(<[^>]*>)/).filter(part => part.length > 0);
    
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        if (!part) continue;
        
        if (part.startsWith('</')) {
            indent = Math.max(0, indent - indentSize);
            formatted += ' '.repeat(indent) + part + '\n';
        } else if (part.startsWith('<')) {
            const tagMatch = part.match(/<(\w+)/);
            const tagName = tagMatch ? tagMatch[1].toLowerCase() : '';
            
            const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
            const isSelfClosing = part.endsWith('/>') || voidElements.includes(tagName);
            
            formatted += ' '.repeat(indent) + part + '\n';
            
            if (!isSelfClosing) {
                indent += indentSize;
            }
        } else {
            if (part.length > 0) {
                formatted += ' '.repeat(indent) + part + '\n';
            }
        }
    }
    
    return formatted.trim();
}

function formatCSS(css) {
    if (!css || css.trim().length === 0) return css;
    
    let formatted = '';
    let indent = 0;
    const indentSize = 2;
    
    let cleanCss = css
        .replace(/\s*{\s*/g, ' {\n')
        .replace(/;\s*/g, ';\n')
        .replace(/\s*}\s*/g, '\n}\n')
        .replace(/\n\s*\n/g, '\n')
        .trim();
    
    const lines = cleanCss.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        
        if (trimmed === '}') {
            indent = Math.max(0, indent - indentSize);
            formatted += ' '.repeat(indent) + trimmed + '\n';
        } else if (trimmed.endsWith('{')) {
            formatted += ' '.repeat(indent) + trimmed + '\n';
            indent += indentSize;
        } else {
            formatted += ' '.repeat(indent) + trimmed + '\n';
        }
    }
    
    return formatted.trim();
}

function formatJavaScript(js) {
    if (!js || js.trim().length === 0) return js;
    
    let formatted = '';
    let indent = 0;
    const indentSize = 2;
    
    const lines = js.split('\n');
    
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            formatted += '\n';
            continue;
        }
        
        // Decrease indent for closing braces
        if (trimmed.startsWith('}')) {
            indent = Math.max(0, indent - indentSize);
        }
        
        formatted += ' '.repeat(indent) + trimmed + '\n';
        
        // Increase indent after opening braces
        if (trimmed.endsWith('{')) {
            indent += indentSize;
        }
    }
    
    return formatted.trim();
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

function shouldShowPreview(code) {
    if (!code) return false;
    const hasHtmlTags = /<\s*[a-zA-Z][^>]*>/i.test(code);
    return hasHtmlTags && code.trim().length > 0;
}

function showHtmlPreview(code) {
    elements.htmlPreview.classList.remove('hidden');
    
    const cleanCode = code.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    const previewDocument = createPreviewDocument(cleanCode);
    
    elements.previewFrame.srcdoc = previewDocument;
}

function createPreviewDocument(htmlCode) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { 
      margin: 0; 
      padding: 20px; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    * { 
      box-sizing: border-box; 
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 0;
      margin-bottom: 0.5em;
      color: #2c3e50;
    }
    p {
      margin-bottom: 1em;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f8f9fa;
      font-weight: bold;
      color: #495057;
    }
    form {
      margin-bottom: 1em;
    }
    input, textarea, select, button {
      margin: 4px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
    }
    button {
      background-color: #007bff;
      color: white;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover {
      background-color: #0056b3;
    }
    ul, ol {
      padding-left: 2em;
    }
    li {
      margin-bottom: 0.25em;
    }
    a {
      color: #007bff;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .card {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      margin: 1rem 0;
      background: #f8f9fa;
    }
    video {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  ${htmlCode}
</body>
</html>`;
}

function togglePreviewExpand() {
    const container = document.querySelector('.preview-container');
    const button = elements.expandPreview;
    const isExpanded = container.classList.contains('expanded');
    
    if (isExpanded) {
        container.classList.remove('expanded');
        button.innerHTML = '<i data-lucide="external-link"></i> <span>Expand</span>';
    } else {
        container.classList.add('expanded');
        button.innerHTML = '<i data-lucide="external-link"></i> <span>Collapse</span>';
    }
    
    initializeLucideIcons();
}

// Answer handling
function handleAnswer(userAnswer) {
    if (!currentChallenge) return;
    
    // Update challenge with user answer
    currentChallenge.userAnswer = userAnswer;
    
    // Hide answer buttons and show reveal
    elements.answerButtons.classList.add('hidden');
    elements.answerReveal.classList.remove('hidden');
    
    // Update result display
    const isCorrect = userAnswer === currentChallenge.isCorrect;
    
    // Update result box
    const resultBox = elements.userResult;
    const resultHeader = resultBox.querySelector('.result-header');
    
    if (isCorrect) {
        resultBox.className = 'result-box correct';
        if (resultHeader) resultHeader.className = 'result-header correct';
        elements.resultIcon.setAttribute('data-lucide', 'check-circle');
        elements.resultText.textContent = '🎉 Correct!';
    } else {
        resultBox.className = 'result-box incorrect';
        if (resultHeader) resultHeader.className = 'result-header incorrect';
        elements.resultIcon.setAttribute('data-lucide', 'x-circle');
        elements.resultText.textContent = '❌ Incorrect!';
    }
    
    // Update answer badges
    elements.userAnswerBadge.textContent = userAnswer ? 'Correct' : 'Incorrect';
    elements.userAnswerBadge.className = `result-badge ${userAnswer ? 'correct' : 'incorrect'}`;
    
    elements.actualAnswerBadge.textContent = currentChallenge.isCorrect ? 'Correct' : 'Incorrect';
    elements.actualAnswerBadge.className = `result-badge ${currentChallenge.isCorrect ? 'correct' : 'incorrect'}`;
    
    // Update explanation
    elements.explanationTitle.textContent = currentChallenge.isCorrect ? '✅ Why it\'s correct:' : '❌ Why it\'s incorrect:';
    elements.explanationTitle.className = currentChallenge.isCorrect ? 'correct' : 'incorrect';
    elements.explanationText.textContent = currentChallenge.explanation;
    
    // Show additional info if available
    if (currentChallenge.additionalInfo) {
        elements.additionalInfo.classList.remove('hidden');
        elements.additionalInfoText.textContent = currentChallenge.additionalInfo;
    } else {
        elements.additionalInfo.classList.add('hidden');
    }
    
    // Save to history
    saveToHistory(currentChallenge);
    
    initializeLucideIcons();
}

// History functions
function saveToHistory(challenge) {
    challengeHistory.unshift(challenge);
    challengeHistory = challengeHistory.slice(0, 50); // Keep last 50
    localStorage.setItem('codeleap-history', JSON.stringify(challengeHistory));
}

function updateHistoryDisplay() {
    updateStats();
    updateHistoryList();
}

function updateStats() {
    const total = challengeHistory.length;
    const answeredChallenges = challengeHistory.filter(c => c.userAnswer !== undefined);
    const correct = answeredChallenges.filter(c => c.userAnswer === c.isCorrect).length;
    const accuracy = answeredChallenges.length > 0 ? Math.round((correct / answeredChallenges.length) * 100) : 0;
    
    elements.totalChallenges.textContent = answeredChallenges.length;
    elements.accuracyPercent.textContent = `${accuracy}%`;
    elements.correctAnswers.textContent = correct;
    elements.incorrectAnswers.textContent = answeredChallenges.length - correct;
    
    // By difficulty
    elements.easyCount.textContent = challengeHistory.filter(c => c.difficulty === 'easy').length;
    elements.mediumCount.textContent = challengeHistory.filter(c => c.difficulty === 'medium').length;
    elements.hardCount.textContent = challengeHistory.filter(c => c.difficulty === 'hard').length;
    
    // By language
    elements.jsCount.textContent = challengeHistory.filter(c => c.language === 'javascript').length;
    elements.htmlCount.textContent = challengeHistory.filter(c => c.language === 'html').length;
    elements.cssCount.textContent = challengeHistory.filter(c => c.language === 'css').length;
}

function updateHistoryList() {
    if (challengeHistory.length === 0) {
        elements.emptyHistory.classList.remove('hidden');
        elements.historyList.innerHTML = '';
        elements.historyList.appendChild(elements.emptyHistory);
        return;
    }
    
    elements.emptyHistory.classList.add('hidden');
    
    const historyHTML = challengeHistory.map(challenge => {
        const languageIcons = {
            javascript: '🟨',
            html: '🟧',
            css: '🟦'
        };
        
        const isCorrect = challenge.userAnswer === challenge.isCorrect;
        const resultIcon = isCorrect ? 'check-circle' : 'x-circle';
        const resultClass = isCorrect ? 'correct' : 'incorrect';
        
        const timestamp = new Date(challenge.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const codePreview = challenge.code.length > 100 
            ? challenge.code.substring(0, 100) + '...'
            : challenge.code;
        
        return `
            <div class="history-item">
                <div class="history-header">
                    <div class="history-badges">
                        <div class="language-badge">
                            <span>${languageIcons[challenge.language]}</span>
                            <span>${challenge.language.charAt(0).toUpperCase() + challenge.language.slice(1)}</span>
                        </div>
                        <div class="difficulty-badge ${challenge.difficulty}">${challenge.difficulty.toUpperCase()}</div>
                    </div>
                    <div class="history-result ${resultClass}">
                        <i data-lucide="${resultIcon}"></i>
                        <span class="history-timestamp">${timestamp}</span>
                    </div>
                </div>
                <p class="history-problem">${challenge.problem}</p>
                <div class="history-code">${escapeHtml(codePreview)}</div>
                <div class="history-details">
                    <strong>Your answer:</strong> ${challenge.userAnswer ? 'Correct' : 'Incorrect'} | 
                    <strong>Actual:</strong> ${challenge.isCorrect ? 'Correct' : 'Incorrect'}
                </div>
            </div>
        `;
    }).join('');
    
    elements.historyList.innerHTML = historyHTML;
    initializeLucideIcons();
}

// Update UI based on current state
function updateUI() {
    // Show/hide API key button
    if (apiKey) {
        elements.generateChallenge.disabled = false;
    } else {
        elements.generateChallenge.disabled = true;
    }
    
    // Update control labels
    updateControlLabels();
    
    // Update history if on history tab
    if (elements.historyTab && elements.historyTab.classList.contains('active')) {
        updateHistoryDisplay();
    }
}
