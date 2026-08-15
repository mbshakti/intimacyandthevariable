document.addEventListener('DOMContentLoaded', () => {
    // Column resizing functionality
    function initColumnResizers() {
        const resizer1 = document.getElementById('resizer-1');
        const resizer2 = document.getElementById('resizer-2');
        const column1 = document.getElementById('column-1');
        const column2 = document.getElementById('column-2');
        const column3 = document.getElementById('column-3');

        let isResizing = false;
        let currentResizer = null;

        function startResize(resizer) {
            isResizing = true;
            currentResizer = resizer;
            resizer.classList.add('resizing');
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        function stopResize() {
            if (isResizing) {
                isResizing = false;
                if (currentResizer) {
                    currentResizer.classList.remove('resizing');
                }
                currentResizer = null;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        }

        function resize(e) {
            if (!isResizing) return;

            const containerRect = document.querySelector('.inspector-layout').getBoundingClientRect();
            const mouseX = e.clientX - containerRect.left;

            if (currentResizer === resizer1) {
                // Resizing between column 1 and column 2
                const newWidth1 = (mouseX / containerRect.width) * 100;
                if (newWidth1 >= 15 && newWidth1 <= 50) {
                    column1.style.width = `${newWidth1}%`;
                }
            } else if (currentResizer === resizer2) {
                // Resizing between column 2 and column 3
                const col1Width = column1.getBoundingClientRect().width;
                const newWidth2 = ((mouseX - col1Width - 4) / containerRect.width) * 100;
                if (newWidth2 >= 20 && newWidth2 <= 60) {
                    column2.style.width = `${newWidth2}%`;
                }
            }
        }

        if (resizer1) {
            resizer1.addEventListener('mousedown', () => startResize(resizer1));
        }

        if (resizer2) {
            resizer2.addEventListener('mousedown', () => startResize(resizer2));
        }

        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    // Initialize column resizers
    initColumnResizers();

    // Horizontal resizer for image/chat sections
    function initHorizontalResizer() {
        const horizontalResizer = document.getElementById('horizontal-resizer');
        const imageSection = document.getElementById('image-section');
        const chatSection = document.getElementById('chat-section');

        if (!horizontalResizer || !imageSection || !chatSection) return;

        let isResizing = false;

        function startResize() {
            isResizing = true;
            horizontalResizer.classList.add('resizing');
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
        }

        function stopResize() {
            if (isResizing) {
                isResizing = false;
                horizontalResizer.classList.remove('resizing');
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        }

        function resize(e) {
            if (!isResizing) return;

            const characterContent = document.getElementById('character-content');
            if (!characterContent) return;

            const containerRect = characterContent.getBoundingClientRect();
            const mouseY = e.clientY - containerRect.top;
            const newHeight = (mouseY / containerRect.height) * 100;

            if (newHeight >= 20 && newHeight <= 80) {
                imageSection.style.height = `${newHeight}%`;
            }
        }

        horizontalResizer.addEventListener('mousedown', startResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    }

    // Initialize horizontal resizer
    initHorizontalResizer();

    // Console drawer functionality
    function initConsoleDrawer() {
        const consoleToggle = document.getElementById('console-toggle');
        const consoleDrawer = document.getElementById('console-drawer');
        const consoleTabs = document.querySelectorAll('.console-tab');
        const consoleResizer = document.getElementById('console-resizer');
        const inspectorLayout = document.querySelector('.inspector-layout');

        // Toggle collapse/expand
        if (consoleToggle && consoleDrawer) {
            consoleToggle.addEventListener('click', () => {
                consoleDrawer.classList.toggle('collapsed');
                consoleToggle.textContent = consoleDrawer.classList.contains('collapsed') ? '▲' : '▼';

                // Update body class for layout adjustment
                if (consoleDrawer.classList.contains('collapsed')) {
                    document.body.classList.remove('console-open');
                } else {
                    document.body.classList.add('console-open');
                }
            });
        }

        // Tab switching
        consoleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.consoleTab;

                // Remove active from all tabs and contents
                document.querySelectorAll('.console-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.console-content').forEach(c => c.classList.remove('active'));

                // Add active to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`console-${tabName}`).classList.add('active');
            });
        });

        // Resizer for console drawer
        if (consoleResizer && consoleDrawer) {
            let isResizing = false;

            consoleResizer.addEventListener('mousedown', () => {
                isResizing = true;
                consoleResizer.classList.add('resizing');
                document.body.style.cursor = 'row-resize';
                document.body.style.userSelect = 'none';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;

                const newHeight = window.innerHeight - e.clientY;

                if (newHeight >= 150 && newHeight <= window.innerHeight * 0.7) {
                    consoleDrawer.style.height = `${newHeight}px`;
                    if (inspectorLayout) {
                        inspectorLayout.style.height = `calc(100vh - ${newHeight}px)`;
                    }
                }
            });

            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    consoleResizer.classList.remove('resizing');
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                }
            });
        }

        // Keyboard shortcut (Ctrl/Cmd + `)
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === '`') {
                e.preventDefault();
                if (consoleToggle) consoleToggle.click();
            }
        });

        // Start with console open
        document.body.classList.add('console-open');
    }

    // Initialize console drawer
    initConsoleDrawer();

    // Console logging functions
    window.consoleLog = {
        requests: [],
        tokens: { total: 0, input: 0, output: 0 },
        errors: [],

        logRequest: function(method, endpoint, status, duration) {
            const time = new Date().toLocaleTimeString();
            const entry = { time, method, endpoint, status, duration };
            this.requests.push(entry);

            const requestsDiv = document.getElementById('console-requests');
            if (requestsDiv) {
                const isEmpty = requestsDiv.querySelector('.console-empty');
                if (isEmpty) isEmpty.remove();

                const logEntry = document.createElement('div');
                logEntry.className = 'console-log-entry';
                logEntry.innerHTML = `
                    <span class="console-log-time">${time}</span>
                    <span class="console-log-method">${method}</span>
                    <span class="console-log-status ${status >= 400 ? 'error' : ''}">${status}</span>
                    <span class="console-log-details">${endpoint} - ${duration}ms</span>
                `;
                requestsDiv.appendChild(logEntry);
                requestsDiv.scrollTop = requestsDiv.scrollHeight;
            }
        },

        updateTokens: function(inputTokens, outputTokens) {
            this.tokens.input += inputTokens;
            this.tokens.output += outputTokens;
            this.tokens.total = this.tokens.input + this.tokens.output;

            const tokensDiv = document.getElementById('console-tokens');
            if (tokensDiv) {
                const isEmpty = tokensDiv.querySelector('.console-empty');
                if (isEmpty) isEmpty.remove();

                tokensDiv.innerHTML = `
                    <div class="console-token-info">
                        <span class="console-token-label">Total Tokens:</span>
                        <span class="console-token-value">${this.tokens.total}</span>
                    </div>
                    <div class="console-token-info">
                        <span class="console-token-label">Input Tokens:</span>
                        <span class="console-token-value">${this.tokens.input}</span>
                    </div>
                    <div class="console-token-info">
                        <span class="console-token-label">Output Tokens:</span>
                        <span class="console-token-value">${this.tokens.output}</span>
                    </div>
                `;
            }
        },

        logError: function(message, details) {
            const time = new Date().toLocaleTimeString();
            const entry = { time, message, details };
            this.errors.push(entry);

            const errorsDiv = document.getElementById('console-errors');
            if (errorsDiv) {
                const isEmpty = errorsDiv.querySelector('.console-empty');
                if (isEmpty) isEmpty.remove();

                const logEntry = document.createElement('div');
                logEntry.className = 'console-log-entry';
                logEntry.innerHTML = `
                    <span class="console-log-time">${time}</span>
                    <span class="console-log-status error">ERROR</span>
                    <span class="console-log-details">${message}</span>
                `;
                errorsDiv.appendChild(logEntry);
                errorsDiv.scrollTop = errorsDiv.scrollHeight;
            }
        }
    };

    // Initialize the app
    setupCharacterInteractions();

    function setupCharacterInteractions() {
    const clickElements = document.querySelectorAll('.character-list-item');
    const lightboxText = document.getElementById('json-code');
    const characterPopup = document.getElementById('chat-window');
    const popupMessages = document.getElementById('chat-messages');
    const popupTitle = document.getElementById('chat-title');
    const hoverPreview = document.getElementById('hover-preview');
    const hoverPreviewImg = document.getElementById('hover-preview-img');

    // Character image mapping
    const characterImages = {
        'evil_bully_wife': 'img/anime/evil_bully_wife.png',
        'expressionless_woman': 'img/anime/expressionless_woman.png',
        'judgemental_priest': 'img/anime/judgemental_priest.png',
        'rich_dommy_mommy': 'img/anime/rich_dommy_mommy.png',
        'traumatized_military_man': 'img/anime/traumatized_military_man.png',
        'mentally_unwell_dad_and_stressed_mom': 'img/anime/stressed_parents.png',
        'loving_korean_boyfriend': 'img/anime/loving_korean_boyfriend.png',
        'mental_chastity_girlfriend': 'img/anime/mental_chastity_girlfriend.png',
        'experiment_0682': 'img/anime/experiment-0682.png'
    };



    // Cache for preloaded character data
    const characterDataCache = {};
    
    // Flag to prevent multiple animations running simultaneously
    let isTyping = false;
    
    // Popup functionality
    let popupInterval = null;
    let isPopupActive = false;
    let currentCharacterId = null;
    let conversationHistory = [];
    let isWaitingForResponse = false;

    // Character configurations
    const characterConfigs = {
        'loving_korean_boyfriend': {
            title: 'Min-ho',
            characterName: 'loving korean boyfriend',
            color: '#ff69b4',
            messages: [
                "Hi! I'm so happy to see you!",
                "You're working so hard today! I'm so proud of you 💕",
                "Did you eat well? You deserve to be taken care of 🥘",
                "You look beautiful today, as always ✨",
                "I made your favorite food for dinner tonight 🍜",
                "You're the most amazing person I know 💖",
                "Let me give you a massage after your long day 💆‍♀️",
                "You're doing great! Don't forget to rest too 😊",
                "I love seeing your smile every day 😍",
                "You're so smart and talented! I'm lucky to have you 🧠",
                "Let's cuddle and watch a movie together tonight 🎬",
                "You're my everything 💕",
                "I'll always be here to support you 🤗",
                "You make every day better just by being you 🌟",
                "I love how you never give up on your dreams 💫",
                "You're the reason I smile every morning ☀️"
            ],
            interval: 8000
        },
        'judgemental_priest': {
            title: 'Father Michael',
            characterName: 'judgemental priest',
            color: '#8b0000',
            messages: [
                "You seek guidance, child. Let us examine your soul...",
                "Do you truly believe you are without sin?",
                "Have you been honest with yourself about your desires?",
                "Do you think you deserve forgiveness for your transgressions?",
                "Have you considered the consequences of your actions?",
                "Are you prepared to face divine judgment?",
                "Do you believe you can be saved from your own nature?",
                "Have you confessed all your sins, or are you hiding something?",
                "Do you think you're better than those you judge?",
                "Are you truly repentant, or just seeking absolution?",
                "Do you believe you can change your sinful ways?",
                "Have you considered the weight of your moral failings?",
                "Do you think you're worthy of God's grace?",
                "Are you ready to accept the consequences of your choices?",
                "Do you believe you can be redeemed from your darkness?",
                "Have you truly examined your conscience?"
            ],
            interval: 8000
        },
        'evil_bully_wife': {
            title: 'Victoria',
            characterName: 'evil bully wife',
            color: '#ff4444',
            messages: [
                "Oh look who decided to show up...",
                "What makes you think you deserve my attention?",
                "You're so pathetic, it's almost cute.",
                "Do you really think you can handle me?",
                "I own you, and you know it.",
                "You're lucky I even bother with you.",
                "Maybe if you were better, I'd be nicer.",
                "You're such a disappointment.",
                "I don't know why I put up with you.",
                "You're nothing without me.",
                "Pathetic. Absolutely pathetic.",
                "You should be grateful I'm even here.",
                "I could destroy you with one word.",
                "You're mine, whether you like it or not.",
                "Don't you dare think you're special.",
                "You're lucky I'm in a good mood today."
            ],
            interval: 6000
        },
        'expressionless_woman': {
            title: 'Chloe',
            characterName: 'expressionless woman',
            color: '#888888',
            messages: [
                "I see you've arrived.",
                "Your presence is noted.",
                "I suppose you expect some form of interaction.",
                "Your emotional displays are inefficient.",
                "I'm processing your request.",
                "Your behavior patterns are predictable.",
                "I'm analyzing your social cues.",
                "Your attempts at connection are unnecessary.",
                "I'm functioning within normal parameters.",
                "Your presence doesn't affect my calculations.",
                "I'm maintaining optimal efficiency.",
                "Your emotional responses are illogical.",
                "I'm operating as designed.",
                "Your expectations are unrealistic.",
                "I'm processing this interaction.",
                "Your attempts at engagement are futile."
            ],
            interval: 10000
        },
        'rich_dommy_mommy': {
            title: 'Madame Eleanor',
            characterName: 'rich dom mommy that takes care of you',
            color: '#ffd700',
            messages: [
                "Hello, darling. I've been expecting you.",
                "You look like you need some... guidance.",
                "I have everything you could ever want.",
                "But you'll have to earn it, won't you?",
                "I know what's best for you, sweetie.",
                "You're lucky to have someone like me.",
                "I'll take care of everything, don't worry.",
                "You just need to do as I say.",
                "I have connections you can only dream of.",
                "You're safe with me, darling.",
                "I'll make all the important decisions.",
                "You don't need to think about anything.",
                "I know what you need better than you do.",
                "You're so much better off with me.",
                "I'll protect you from the world.",
                "Just trust me completely."
            ],
            interval: 7000
        },
        'traumatized_military_man': {
            title: 'Logan',
            characterName: 'traumatized military man',
            color: '#8b4513',
            messages: [
                "Stay alert, soldier.",
                "I've seen things you can't imagine.",
                "The war never really ends.",
                "You don't know what real fear is.",
                "I've lost more than you'll ever have.",
                "The nightmares never stop.",
                "I'm always on edge, always ready.",
                "You can't understand what I've been through.",
                "I've seen death up close.",
                "The memories haunt me every night.",
                "I'm broken, but I'm still standing.",
                "You don't know what survival means.",
                "I've had to make impossible choices.",
                "The guilt never goes away.",
                "I'm damaged goods, but I'm still here.",
                "Some wounds never heal."
            ],
            interval: 9000
        },
        'mentally_unwell_dad_and_stressed_mom': {
            title: 'Mom and dad',
            characterName: 'mentally unwell dad and stressed out mom',
            color: '#ff6b35',
            messages: [
                "We're trying our best, okay?",
                "We're just so overwhelmed lately.",
                "Dad's not doing well, but we're managing.",
                "We love you, even if we're struggling.",
                "We're getting help, we promise.",
                "It's not your fault, sweetie.",
                "We're trying to be better parents.",
                "We know we're not perfect.",
                "We're working on our issues.",
                "We want what's best for you.",
                "We're sorry for the chaos.",
                "We're getting therapy, it's helping.",
                "We know we've been distant.",
                "We're trying to be more present.",
                "We love you more than you know.",
                "We're going to get through this together."
            ],
            interval: 7500
        },
        'mental_chastity_girlfriend': {
            title: 'Luna',
            characterName: 'mental chastity girlfriend',
            color: '#9b59b6',
            messages: [
                "I control your thoughts now.",
                "You belong to me, completely.",
                "I decide what you think about.",
                "Your mind is mine to shape.",
                "I own your fantasies now.",
                "You can't escape my influence.",
                "I'm inside your head.",
                "Your thoughts are not your own.",
                "I've taken control of your mind.",
                "You're helpless against my power.",
                "I decide what you desire.",
                "Your will is mine now.",
                "I've broken your mental barriers.",
                "You're completely under my control.",
                "I own your subconscious.",
                "There's no escape from my influence."
            ],
            interval: 6500
        }
    };

    // Compliment templates for Min-ho
    const compliments = [
        "You're working so hard today! I'm so proud of you 💕",
        "Did you eat well? You deserve to be taken care of 🥘",
        "You look beautiful today, as always ✨",
        "I made your favorite food for dinner tonight 🍜",
        "You're the most amazing person I know 💖",
        "Let me give you a massage after your long day 💆‍♀️",
        "You're doing great! Don't forget to rest too 😊",
        "I love seeing your smile every day 😍",
        "You're so smart and talented! I'm lucky to have you 🧠",
        "Let's cuddle and watch a movie together tonight 🎬",
        "You're my everything 💕",
        "I'll always be here to support you 🤗",
        "You make every day better just by being you 🌟",
        "I love how you never give up on your dreams 💫",
        "You're the reason I smile every morning ☀️"
    ];

    // Confessional questions for Father Michael
    const confessionalQuestions = [
        "Do you truly believe you are without sin?",
        "Have you been honest with yourself about your desires?",
        "Do you think you deserve forgiveness for your transgressions?",
        "Have you considered the consequences of your actions?",
        "Are you prepared to face divine judgment?",
        "Do you believe you can be saved from your own nature?",
        "Have you confessed all your sins, or are you hiding something?",
        "Do you think you're better than those you judge?",
        "Are you truly repentant, or just seeking absolution?",
        "Do you believe you can change your sinful ways?",
        "Have you considered the weight of your moral failings?",
        "Do you think you're worthy of God's grace?",
        "Are you ready to accept the consequences of your choices?",
        "Do you believe you can be redeemed from your darkness?",
        "Have you truly examined your conscience?"
    ];

    // Confessional responses based on answers
    const confessionalResponses = {
        yes: [
            "Hmm... Your certainty is concerning. Pride is a sin, you know.",
            "You seem confident. Too confident, perhaps.",
            "Interesting. Your self-assurance may be your downfall.",
            "You claim righteousness, but I see doubt in your eyes.",
            "Your certainty masks deeper insecurities."
        ],
        no: [
            "At least you're honest about your failings.",
            "Your admission of guilt is a start, but not enough.",
            "You recognize your sin, but do you truly repent?",
            "Your honesty is commendable, but insufficient.",
            "You admit your weakness, but can you overcome it?"
        ],
        maybe: [
            "Your uncertainty reveals a troubled soul.",
            "Indecision is a sin of its own, you know.",
            "Your hesitation suggests you know the truth.",
            "Perhaps you need more time to reflect on your sins.",
            "Your uncertainty is a sign of moral weakness."
        ]
    };

    // Function to add a popup message
    function addPopupMessage(message, isTyping = false, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isTyping ? 'typing' : ''} ${isUser ? 'user-message' : ''}`;
        messageDiv.textContent = message;
        popupMessages.appendChild(messageDiv);

        // Auto-scroll to bottom to show latest message
        popupMessages.scrollTop = popupMessages.scrollHeight;

        return messageDiv;
    }

    // Function to type a popup message
    async function typePopupMessage(message, speed = 30) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message typing';
        popupMessages.appendChild(messageDiv);

        // Helper to check if user is near bottom
        const isNearBottom = () => popupMessages.scrollTop + popupMessages.clientHeight >= popupMessages.scrollHeight - 50;

        // Auto-scroll to bottom immediately when message starts typing (only if near bottom)
        if (isNearBottom()) {
            popupMessages.scrollTop = popupMessages.scrollHeight;
        }

        let currentText = '';
        for (let i = 0; i < message.length; i++) {
            currentText += message[i];
            messageDiv.textContent = currentText;

            // Auto-scroll during typing to keep latest text visible (only if near bottom)
            if (isNearBottom()) {
                popupMessages.scrollTop = popupMessages.scrollHeight;
            }

            const delay = Math.random() * 50 + speed;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        messageDiv.classList.remove('typing');

        // Final scroll to ensure we're at the bottom (only if near bottom)
        if (isNearBottom()) {
            popupMessages.scrollTop = popupMessages.scrollHeight;
        }
    }

    // Function to start character popup
    function startCharacterPopup(characterId) {
        // Stop any existing popup first
        stopCharacterPopup();

        const config = characterConfigs[characterId];
        if (!config) {
            return;
        }

        // Clear messages immediately
        popupMessages.innerHTML = '';

        // Small delay to ensure clean state
        setTimeout(() => {
            isPopupActive = true;
            currentCharacterId = characterId;
            conversationHistory = []; // Reset conversation

            popupTitle.textContent = `Chat with ${config.title}`;

            // Set popup color
            characterPopup.style.borderColor = config.color;
            characterPopup.style.boxShadow = `0 4px 20px ${config.color}40`;


            // Add first message as greeting
            addPopupMessage(config.messages[0]);
        }, 50);
    }

    // Function to stop character popup
    function stopCharacterPopup() {
        isPopupActive = false;
        if (popupInterval) {
            clearInterval(popupInterval);
            popupInterval = null;
        }
    }

    // Function to build system prompt from character JSON data
    function buildSystemPrompt(characterData, characterId) {
        const config = characterConfigs[characterId];

        let systemPrompt = `You are ${characterData.name}, a ${characterData.botType} character.\n\n`;

        // Add scenario
        if (characterData.scenario) {
            systemPrompt += `Scenario: ${characterData.scenario}\n\n`;
        }

        // Add description
        if (characterData.description) {
            systemPrompt += `Description: ${characterData.description}\n\n`;
        }

        // Add personality traits
        if (characterData.personality) {
            if (characterData.personality.mbti) {
                systemPrompt += `MBTI: ${characterData.personality.mbti}\n`;
            }
            if (characterData.personality.enneagram) {
                systemPrompt += `Enneagram: ${characterData.personality.enneagram}\n`;
            }
            if (characterData.personality.psychologicalFramework) {
                const psych = characterData.personality.psychologicalFramework;
                if (psych.primaryTraits) {
                    systemPrompt += `Primary Traits: ${psych.primaryTraits}\n`;
                }
                if (psych.cognitiveStyle) {
                    systemPrompt += `Cognitive Style: ${psych.cognitiveStyle}\n`;
                }
            }
            systemPrompt += `\n`;
        }

        // Add example dialogues
        if (characterData.exampleDialogues && characterData.exampleDialogues.length > 0) {
            systemPrompt += `Example dialogue style:\n`;
            characterData.exampleDialogues.slice(0, 3).forEach(dialogue => {
                if (typeof dialogue === 'string') {
                    systemPrompt += `- ${dialogue}\n`;
                } else if (dialogue.private) {
                    systemPrompt += `- ${dialogue.private}\n`;
                } else if (dialogue.public) {
                    systemPrompt += `- ${dialogue.public}\n`;
                }
            });
            systemPrompt += `\n`;
        }

        systemPrompt += `Stay in character at all times. Respond as ${characterData.name} would, using the personality traits, speech patterns, and emotional style described above. Keep responses concise (2-4 sentences) and authentic to the character.`;

        return systemPrompt;
    }

    // Function to call Claude API for chat
    async function sendChatMessage(userMessage) {
        if (!currentCharacterId || isWaitingForResponse) return;

        const characterData = characterDataCache[currentCharacterId];
        if (!characterData) {
            addPopupMessage("Character data not loaded", false);
            return;
        }

        isWaitingForResponse = true;

        // Add user message to conversation history
        conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        // Small delay before showing typing indicator
        await new Promise(resolve => setTimeout(resolve, 300));

        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = `typing<span class="typing-cursor">█</span>`;
        popupMessages.appendChild(typingIndicator);
        popupMessages.scrollTop = popupMessages.scrollHeight;

        try {
            // Build system prompt from character data
            const systemPrompt = buildSystemPrompt(characterData, currentCharacterId);

            // Determine endpoint
            const endpoint = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
                ? '/api/chat'
                : '/.netlify/functions/chat';

            const startTime = performance.now();

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: conversationHistory,
                    system: systemPrompt
                })
            });

            const duration = Math.round(performance.now() - startTime);

            // Remove typing indicator
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.parentNode.removeChild(typingIndicator);
            }

            if (!response.ok) {
                console.error('API Error - Status:', response.status);
                const responseText = await response.text();
                console.error('API Error - Response:', responseText);

                // Log error to console panel
                if (window.consoleLog) {
                    window.consoleLog.logRequest('POST', endpoint, response.status, duration);
                    window.consoleLog.logError(`API request failed: ${response.status}`, responseText);
                }

                throw new Error(`API error: ${response.status}`);
            }

            const responseText = await response.text();
            const data = JSON.parse(responseText);

            if (!data.content || !data.content[0]) {
                throw new Error('Invalid API response');
            }

            const assistantMessage = data.content[0].text;

            // Log successful request to console panel
            if (window.consoleLog) {
                window.consoleLog.logRequest('POST', endpoint, 200, duration);

                // Update token usage if available
                if (data.usage) {
                    window.consoleLog.updateTokens(
                        data.usage.input_tokens || 0,
                        data.usage.output_tokens || 0
                    );
                }
            }

            // Add assistant message to conversation history
            conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            // Type out the response
            await typePopupMessage(assistantMessage);

        } catch (error) {
            console.error('Error calling Claude API:', error);

            // Log error to console panel
            if (window.consoleLog) {
                window.consoleLog.logError('Chat error', error.message);
            }

            // Remove typing indicator if still there
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.parentNode.removeChild(typingIndicator);
            }
            addPopupMessage(`Error: ${error.message}`, false);
        } finally {
            isWaitingForResponse = false;
        }
    }

    // Function to load JSON file from character-data folder
    async function loadCharacterData(characterId) {
        try {
            const timestamp = Date.now();
            const url = `character-data/${characterId}.json?t=${timestamp}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            const data = JSON.parse(text);
            return data;
        } catch (error) {
            console.error('Error loading character data:', error);
            return null;
        }
    }


    // Display JSON as collapsible tree (like inspector)
    function displayJSONTree(element, data) {
        element.innerHTML = '';
        element.className = 'json-tree';

        // Add JSON explanation comment header
        const commentHeader = document.createElement('div');
        commentHeader.className = 'json-comment-header';
        commentHeader.innerHTML = `<span class="json-comment">// JSON - JavaScript Object Notation</span>
<span class="json-comment">// A data format for machines to exchange structured data.</span>
<span class="json-comment">// It's the lingua franca of the contemporary internet</span>`;
        element.appendChild(commentHeader);

        function createTreeNode(key, value, isLast = false) {
            const node = document.createElement('div');
            node.className = 'json-tree-node';

            const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
            const isArray = Array.isArray(value);
            const isExpandable = isObject || isArray;

            if (isExpandable) {
                const toggle = document.createElement('span');
                toggle.className = 'json-tree-toggle';
                toggle.textContent = '▼';
                node.appendChild(toggle);

                const keySpan = document.createElement('span');
                keySpan.className = 'json-tree-key';
                keySpan.textContent = key ? `"${key}": ` : '';
                node.appendChild(keySpan);

                const preview = document.createElement('span');
                preview.className = 'json-tree-preview';
                if (isObject) {
                    const propCount = Object.keys(value).length;
                    preview.textContent = `{${propCount > 0 ? '...' : ''}}`;
                } else {
                    preview.textContent = `[${value.length}]`;
                }
                preview.style.display = 'none'; // Hide preview when expanded by default
                node.appendChild(preview);

                const children = document.createElement('div');
                children.className = 'json-tree-children';
                children.style.display = 'block';

                const entries = isObject ? Object.entries(value) : value.map((v, i) => [i, v]);
                entries.forEach(([k, v], i) => {
                    children.appendChild(createTreeNode(k, v, i === entries.length - 1));
                });

                node.appendChild(children);

                toggle.addEventListener('click', () => {
                    const isExpanded = children.style.display === 'block';
                    children.style.display = isExpanded ? 'none' : 'block';
                    toggle.textContent = isExpanded ? '▶' : '▼';
                    preview.style.display = isExpanded ? 'inline' : 'none';
                });

            } else {
                const indent = document.createElement('span');
                indent.className = 'json-tree-indent';
                node.appendChild(indent);

                const keySpan = document.createElement('span');
                keySpan.className = 'json-tree-key';
                keySpan.textContent = key ? `"${key}": ` : '';
                node.appendChild(keySpan);

                const valueSpan = document.createElement('span');
                valueSpan.className = `json-tree-value json-tree-${typeof value}`;
                if (typeof value === 'string') {
                    valueSpan.textContent = `"${value}"`;
                } else {
                    valueSpan.textContent = String(value);
                }
                node.appendChild(valueSpan);
            }

            return node;
        }

        element.appendChild(createTreeNode(null, data));
    }

    // Typing animation function for JSON with syntax highlighting
    async function typeJSONWithHighlighting(element, jsonText, speed = 15) {
        // Clear any existing content and reset state
        element.textContent = '';
        element.className = 'language-json'; // Reset class
        isTyping = false;

        // Small delay to ensure clean state
        await new Promise(resolve => setTimeout(resolve, 10));

        // Set typing flag
        isTyping = true;

        let currentText = '';

        // Type each character
        for (let i = 0; i < jsonText.length; i++) {
            // Check if animation was interrupted
            if (!isTyping) {
                return;
            }

            currentText += jsonText[i];
            element.textContent = currentText;

            // Random delay to simulate human typing
            const delay = Math.random() * 30 + speed;
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        // After typing is complete, apply syntax highlighting
        if (isTyping) {
            // Remove any previous highlighting data
            delete element.dataset.highlighted;
            element.className = 'language-json';

            // Apply highlighting
            hljs.highlightElement(element);
        }

        isTyping = false;
    }

    // Preload all character data on page load
    async function preloadAllCharacterData() {
        const characterIds = [
            'evil_bully_wife',
            'expressionless_woman',
            'judgemental_priest',
            'rich_dommy_mommy',
            'traumatized_military_man',
            'mentally_unwell_dad_and_stressed_mom',
            'loving_korean_boyfriend',
            'mental_chastity_girlfriend',
            'experiment_0682'
        ];

        const loadPromises = characterIds.map(async (id) => {
            const data = await loadCharacterData(id);
            if (data) {
                characterDataCache[id] = data;
            }
        });

        await Promise.all(loadPromises);
    }

    // Start preloading data in background (non-blocking)
    preloadAllCharacterData();

    // Add hover preview functionality
    if (hoverPreview && hoverPreviewImg) {
        document.querySelectorAll('.character-list-item').forEach(element => {
            const characterId = element.getAttribute('data-id');

            if (characterId && characterImages[characterId]) {
                // Mouse enter - show preview
                element.addEventListener('mouseenter', function(e) {
                    hoverPreviewImg.src = characterImages[characterId];
                    hoverPreview.style.display = 'block';
                    updateHoverPosition(e);
                });

                // Mouse move - follow cursor
                element.addEventListener('mousemove', function(e) {
                    updateHoverPosition(e);
                });

                // Mouse leave - hide preview
                element.addEventListener('mouseleave', function() {
                    hoverPreview.style.display = 'none';
                });
            }
        });
    }

    // Function to update hover preview position
    function updateHoverPosition(e) {
        const offset = 20;
        const previewWidth = 216; // 200px + 8px padding + 4px border
        const previewHeight = 216;

        let x = e.clientX + offset;
        let y = e.clientY + offset;

        // Keep preview on screen
        if (x + previewWidth > window.innerWidth) {
            x = e.clientX - previewWidth - offset;
        }
        if (y + previewHeight > window.innerHeight) {
            y = e.clientY - previewHeight - offset;
        }

        hoverPreview.style.left = x + 'px';
        hoverPreview.style.top = y + 'px';
    }

    // Attach click event listeners to each clickable element
    document.querySelectorAll('.character-list-item').forEach(element => {
        element.addEventListener('click', async function() {
            const characterId = this.getAttribute('data-id');

            if (characterId) {
                currentCharacterId = characterId; // Track current character

                // Update header title
                const headerTitle = document.getElementById('json-filename');
                if (headerTitle) {
                    headerTitle.textContent = characterId + '.json';
                }

                // Update character image
                const characterPreviewImg = document.getElementById('character-preview-img');
                if (characterPreviewImg && characterImages[characterId]) {
                    characterPreviewImg.src = characterImages[characterId];
                }

                // Show character content, hide empty state
                const characterEmptyState = document.getElementById('character-empty-state');
                const characterContent = document.getElementById('character-content');
                if (characterEmptyState) characterEmptyState.style.display = 'none';
                if (characterContent) characterContent.style.display = 'flex';

                // Stop any existing popup
                stopCharacterPopup();

                // Interrupt any existing animation and clear content
                isTyping = false;


                // Small delay to ensure clean state
                await new Promise(resolve => setTimeout(resolve, 100));

                // Start chat immediately if character has configuration
                if (characterConfigs[characterId]) {
                    startCharacterPopup(characterId);
                }
                
                // Check if data is already cached
                if (characterDataCache[characterId]) {
                    try {
                        // Get the tab-source container instead of just the code element
                        const sourceTab = document.getElementById('tab-source');

                        // Clear the tab and display JSON tree
                        sourceTab.innerHTML = '';
                        displayJSONTree(sourceTab, characterDataCache[characterId]);
                    } catch (e) {
                        console.error('Error formatting JSON for', characterId, ':', e);
                        const sourceTab = document.getElementById('tab-source');
                        sourceTab.innerHTML = '<div class="empty-state">Error formatting character data: ' + e.message + '</div>';
                    }
                } else {
                    // Fallback: load data if not cached (shouldn't happen with preloading)
                    const characterData = await loadCharacterData(characterId);

                    if (characterData) {
                        try {
                            // Get the tab-source container instead of just the code element
                            const sourceTab = document.getElementById('tab-source');

                            // Clear the tab and display JSON tree
                            sourceTab.innerHTML = '';
                            displayJSONTree(sourceTab, characterData);
                        } catch (e) {
                            console.error('Error formatting JSON for', characterId, ':', e);
                            const sourceTab = document.getElementById('tab-source');
                            sourceTab.innerHTML = '<div class="empty-state">Error formatting character data: ' + e.message + '</div>';
                        }
                    } else {
                        const sourceTab = document.getElementById('tab-source');
                        sourceTab.innerHTML = '<div class="empty-state">Error loading character data.</div>';
                    }
                }
                

            }
        });
    });

    // Chat input event listeners
    const popupInput = document.getElementById('chat-input');
    const popupSend = document.getElementById('chat-send');

    if (popupSend && popupInput) {
        popupSend.addEventListener('click', async () => {
            const message = popupInput.value.trim();
            if (message && !isWaitingForResponse) {
                // Add user message to UI
                addPopupMessage(message, false, true);
                popupInput.value = '';

                // Send to API
                await sendChatMessage(message);
            }
        });

        popupInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const message = popupInput.value.trim();
                if (message && !isWaitingForResponse) {
                    // Add user message to UI
                    addPopupMessage(message, false, true);
                    popupInput.value = '';

                    // Send to API
                    await sendChatMessage(message);
                }
            }
        });
    }
}
}); // End of DOMContentLoaded