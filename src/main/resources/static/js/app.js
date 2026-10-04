document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_KEY = '';

    // ChatGPT SVG Avatar
    const CHATGPT_SVG = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.164a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4018-.5816zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1639a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1458-1.9213l2.552-1.472a.79.79 0 0 0 .3927-.6813V5.8452l2.552 1.472a.071.071 0 0 1 .038.0615v2.944a.79.79 0 0 0 .3927.6813l2.552 1.472-2.552 1.472a.79.79 0 0 0-.3927.6813v2.944a.071.071 0 0 1-.038.0615l-2.552-1.472a.79.79 0 0 0-.3927-.6813v-2.944a.79.79 0 0 0-.3927-.6813z"/>
        </svg>
    `;

    // Personas and dynamic prompt configurations
    const PERSONAS = [
        {
            id: 'general',
            name: 'ChatGPT',
            fullName: 'General Assistant',
            icon: '🤖',
            description: 'Smart, versatile AI companion for everyday queries.',
            heading: 'What can I help with today?',
            chips: [
                { title: 'Write code', desc: 'Clean, efficient scripts or algorithms', prompt: 'Help me write clean, efficient code' },
                { title: 'Explain concept', desc: 'In simple, intuitive terms', prompt: 'Explain a complex concept in simple, intuitive terms' },
                { title: 'Brainstorm ideas', desc: 'For an exciting new project', prompt: 'Brainstorm ideas for an exciting new project' },
                { title: 'Draft a message', desc: 'Clear, polished and professional', prompt: 'Help me write a concise, professional message' }
            ]
        },
        {
            id: 'coder',
            name: 'Code Master',
            fullName: 'Code Master',
            icon: '💻',
            description: 'Specialist in Java, Spring Boot, architecture & algorithms.',
            heading: 'What are we building today?',
            chips: [
                { title: 'Spring Boot REST API', desc: 'Controller with validation & DI', prompt: 'Show me an idiomatic Spring Boot 3 REST controller with validation, exception handling, and service injection.' },
                { title: 'Debug Concurrency', desc: 'Fix ConcurrentModification in Java', prompt: 'Why does ConcurrentModificationException happen in Java and what are the best ways to fix it?' },
                { title: 'Microservice Saga', desc: 'Choreography vs orchestration', prompt: 'Explain the Saga pattern for distributed transactions in microservices with choreography vs orchestration.' },
                { title: 'LRU Cache in Java', desc: 'O(1) get & put implementation', prompt: 'Implement an efficient LRU Cache in Java with O(1) get and put operations.' }
            ]
        },
        {
            id: 'science',
            name: 'Science Tutor',
            fullName: 'Science & Math Tutor',
            icon: '🔬',
            description: 'Explains physics, calculus formulas & scientific concepts.',
            heading: 'What shall we explore today?',
            chips: [
                { title: 'Quantum Computing', desc: 'Superposition & qubits simply explained', prompt: 'Explain quantum computing and superposition in simple, intuitive terms with everyday analogies.' },
                { title: 'Calculus Integration', desc: 'Step-by-step integration by parts', prompt: 'Walk through integration by parts step-by-step with an illustrative, practical calculus example.' },
                { title: 'How CRISPR Works', desc: 'Gene editing mechanisms & medicine', prompt: 'Explain the molecular mechanism of CRISPR-Cas9 gene editing and its modern medical applications.' },
                { title: 'Black Holes', desc: 'Event horizons & Hawking radiation', prompt: 'Explain what happens at the event horizon of a black hole, gravitational time dilation, and Hawking radiation.' }
            ]
        },
        {
            id: 'writer',
            name: 'Creative Writer',
            fullName: 'Creative Writer',
            icon: '✍️',
            description: 'Storytelling, evocative poetry, and persuasive copy.',
            heading: 'What shall we write today?',
            chips: [
                { title: 'Cyberpunk Story', desc: 'Gripping prologue in Neo-Kyoto', prompt: 'Write a gripping prologue for a cyberpunk noir story set in Neo-Kyoto in 2089.' },
                { title: 'Launch Email', desc: 'High-converting announcement copy', prompt: 'Draft a compelling, high-converting product launch email for an innovative developer tool.' },
                { title: 'Character Profiles', desc: 'Three distinct sci-fi personalities', prompt: 'Create three compelling, psychologically distinct character profiles for a sci-fi mystery.' },
                { title: 'Poem on Rain & Neon', desc: 'Atmospheric midnight city verse', prompt: 'Compose an evocative poem capturing the melancholy of rain-soaked neon city streets at midnight.' }
            ]
        },
        {
            id: 'career',
            name: 'Career Coach',
            fullName: 'Career & Business Coach',
            icon: '💼',
            description: 'Resume reviews, STAR interview prep & executive strategy.',
            heading: 'How can I advance your career today?',
            chips: [
                { title: 'Google XYZ Resume Bullets', desc: '5 high-impact metrics-driven points', prompt: 'Provide 5 high-impact, metrics-driven resume bullet points using the Google XYZ formula for a Senior Backend Engineer.' },
                { title: 'STAR Behavioral Answer', desc: 'Technical disagreement interview prep', prompt: 'How do I answer "Tell me about a time you had a technical disagreement with a team lead" using the STAR method?' },
                { title: 'Salary Negotiation', desc: 'Polite, firm counter-offer script', prompt: 'Give me a polite but firm salary negotiation script for countering an initial offer for a tech lead role.' },
                { title: 'System Design Roadmap', desc: '4-week prep for Senior interviews', prompt: 'Give me a structured 4-week roadmap to prepare for Senior/Staff System Design interviews.' }
            ]
        }
    ];

    // State
    const state = {
        sessionId: localStorage.getItem('nova_session_id') || null,
        persona: localStorage.getItem('nova_persona') || 'general',
        provider: localStorage.getItem('nova_provider') || 'gemini',
        apiKey: localStorage.getItem('nova_api_key') || DEFAULT_KEY,
        model: localStorage.getItem('nova_model') || 'gemini-2.5-flash',
        tone: localStorage.getItem('nova_tone') || 'detailed',
        temperature: parseFloat(localStorage.getItem('nova_temperature') || '0.7'),
        theme: localStorage.getItem('nova_theme') || 'dark',
        currentMessages: [],
        isGenerating: false,
        isRecording: false,
        abortController: null
    };

    // DOM Elements
    const elements = {
        themeToggleBtn: document.getElementById('themeToggleBtn'),
        themeIcon: document.getElementById('themeIcon'),
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        openSidebarBtn: document.getElementById('openSidebarBtn'),
        closeSidebarBtn: document.getElementById('closeSidebarBtn'),
        newChatBtn: document.getElementById('newChatBtn'),
        topNewChatBtn: document.getElementById('topNewChatBtn'),
        sessionsList: document.getElementById('sessionsList'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        
        // Model & Persona Dropdown
        modelPillBtn: document.getElementById('modelPillBtn'),
        currentPersonaName: document.getElementById('currentPersonaName'),
        modelDropdown: document.getElementById('modelDropdown'),
        modelOptions: document.getElementById('modelOptions'),

        chatContainer: document.getElementById('chatContainer'),
        welcomeScreen: document.getElementById('welcomeScreen'),
        starterChips: document.getElementById('starterChips'),
        messagesList: document.getElementById('messagesList'),
        typingIndicator: document.getElementById('typingIndicator'),
        
        chatInput: document.getElementById('chatInput'),
        sendBtn: document.getElementById('sendBtn'),
        voiceInputBtn: document.getElementById('voiceInputBtn'),
        micIcon: document.getElementById('micIcon'),
        
        // Settings Modal
        settingsModal: document.getElementById('settingsModal'),
        settingsModalBtn: document.getElementById('settingsModalBtn'),
        closeSettingsModal: document.getElementById('closeSettingsModal'),
        providerSelect: document.getElementById('providerSelect'),
        apiKeyGroup: document.getElementById('apiKeyGroup'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        toggleApiKeyVisibility: document.getElementById('toggleApiKeyVisibility'),
        modelInput: document.getElementById('modelInput'),
        toneSelect: document.getElementById('toneSelect'),
        tempSlider: document.getElementById('tempSlider'),
        tempValue: document.getElementById('tempValue'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),
        resetSettingsBtn: document.getElementById('resetSettingsBtn'),
        
        // Status / Diagnostics Modal
        statusModal: document.getElementById('statusModal'),
        statusModalBtn: document.getElementById('statusModalBtn'),
        closeStatusModal: document.getElementById('closeStatusModal'),
        diagAppName: document.getElementById('diagAppName'),
        diagJavaVersion: document.getElementById('diagJavaVersion'),
        diagMemory: document.getElementById('diagMemory'),
        diagUptime: document.getElementById('diagUptime'),
        diagSessions: document.getElementById('diagSessions'),
        diagPersonas: document.getElementById('diagPersonas'),

        // Export Modal
        exportModal: document.getElementById('exportModal'),
        exportChatBtn: document.getElementById('exportChatBtn'),
        closeExportModal: document.getElementById('closeExportModal'),
        exportMarkdownBtn: document.getElementById('exportMarkdownBtn'),
        exportJsonBtn: document.getElementById('exportJsonBtn'),

        // Toast
        toastNotification: document.getElementById('toastNotification'),
        toastText: document.getElementById('toastText')
    };

    // Configure Marked.js
    if (window.marked) {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                if (window.hljs) {
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {}
                    }
                    return hljs.highlightAuto(code).value;
                }
                return code;
            }
        });
    }

    // Toast Notification helper
    let toastTimeout = null;
    function showToast(message) {
        if (!elements.toastNotification || !elements.toastText) return;
        elements.toastText.textContent = message;
        elements.toastNotification.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            elements.toastNotification.classList.remove('show');
        }, 2200);
    }

    // Theme Management
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        state.theme = theme;
        localStorage.setItem('nova_theme', theme);
        if (elements.themeIcon) {
            elements.themeIcon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    }
    applyTheme(state.theme);

    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', () => {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });
    }

    // Sidebar Toggling
    function toggleSidebar() {
        if (window.innerWidth <= 768) {
            const isOpen = elements.sidebar?.classList.contains('open');
            if (isOpen) {
                elements.sidebar?.classList.remove('open');
                elements.sidebarOverlay?.classList.remove('show');
            } else {
                elements.sidebar?.classList.add('open');
                elements.sidebarOverlay?.classList.add('show');
            }
        } else {
            elements.sidebar?.classList.toggle('collapsed');
        }
    }

    if (elements.openSidebarBtn) elements.openSidebarBtn.addEventListener('click', toggleSidebar);
    if (elements.closeSidebarBtn) elements.closeSidebarBtn.addEventListener('click', toggleSidebar);
    if (elements.sidebarOverlay) {
        elements.sidebarOverlay.addEventListener('click', () => {
            elements.sidebar?.classList.remove('open');
            elements.sidebarOverlay?.classList.remove('show');
        });
    }

    // Model & Persona Dropdown
    function renderModelDropdown() {
        if (!elements.modelOptions) return;
        elements.modelOptions.innerHTML = '';

        PERSONAS.forEach(p => {
            const btn = document.createElement('button');
            btn.className = `model-option ${p.id === state.persona ? 'active' : ''}`;
            btn.innerHTML = `
                <div class="model-option-left">
                    <span class="model-option-icon">${p.icon}</span>
                    <div class="model-option-info">
                        <span class="model-option-title">${escapeHtml(p.name)}</span>
                        <span class="model-option-desc">${escapeHtml(p.description)}</span>
                    </div>
                </div>
                <i class="fa-solid fa-check model-option-check"></i>
            `;

            btn.addEventListener('click', () => {
                selectPersona(p.id);
                closeModelDropdown();
            });

            elements.modelOptions.appendChild(btn);
        });

        updatePersonaDisplay();
    }

    function toggleModelDropdown(e) {
        if (e) e.stopPropagation();
        const isOpen = elements.modelDropdown?.classList.contains('show');
        if (isOpen) {
            closeModelDropdown();
        } else {
            elements.modelDropdown?.classList.add('show');
            elements.modelPillBtn?.setAttribute('aria-expanded', 'true');
        }
    }

    function closeModelDropdown() {
        elements.modelDropdown?.classList.remove('show');
        elements.modelPillBtn?.setAttribute('aria-expanded', 'false');
    }

    if (elements.modelPillBtn) {
        elements.modelPillBtn.addEventListener('click', toggleModelDropdown);
    }

    function selectPersona(personaId) {
        state.persona = personaId;
        localStorage.setItem('nova_persona', personaId);
        updatePersonaDisplay();

        const hasUserMessage = state.currentMessages && state.currentMessages.some(m => m.role === 'user');
        if (!hasUserMessage) {
            renderWelcomeScreen(personaId);
        }
        renderModelDropdown();
    }

    function updatePersonaDisplay() {
        const current = PERSONAS.find(p => p.id === state.persona) || PERSONAS[0];
        if (elements.currentPersonaName) {
            elements.currentPersonaName.textContent = current.name;
        }
    }

    // Dynamic Welcome Screen
    function renderWelcomeScreen(personaId) {
        if (!elements.welcomeScreen) return;
        const conf = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];

        const headingEl = elements.welcomeScreen.querySelector('.welcome-heading');
        if (headingEl) {
            headingEl.textContent = conf.heading;
        }

        if (elements.starterChips) {
            elements.starterChips.innerHTML = conf.chips.map(chip => `
                <button class="starter-chip" data-prompt="${escapeHtml(chip.prompt)}">
                    <span class="chip-title">${escapeHtml(chip.title)}</span>
                    <span class="chip-desc">${escapeHtml(chip.desc)}</span>
                </button>
            `).join('');

            elements.starterChips.querySelectorAll('.starter-chip').forEach(btn => {
                btn.addEventListener('click', () => {
                    const prompt = btn.getAttribute('data-prompt');
                    sendMessage(prompt);
                });
            });
        }
    }

    // Load Sessions
    async function loadSessions() {
        try {
            const response = await fetch('/api/sessions');
            if (!response.ok) return;
            const sessions = await response.json();
            renderSessions(sessions);
        } catch (err) {
            // Silently handle
        }
    }

    function renderSessions(sessions) {
        if (!elements.sessionsList) return;
        elements.sessionsList.innerHTML = '';

        if (!sessions || sessions.length === 0) {
            elements.sessionsList.innerHTML = `
                <div style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem; text-align:center;">
                    No recent chats
                </div>
            `;
            return;
        }

        sessions.forEach(sess => {
            const item = document.createElement('div');
            item.className = `session-item ${sess.id === state.sessionId ? 'active' : ''}`;
            
            // Generate clean title
            let title = 'Chat';
            if (sess.messages && sess.messages.length > 0) {
                const firstUser = sess.messages.find(m => m.role === 'user');
                if (firstUser && firstUser.content) {
                    title = firstUser.content.trim().slice(0, 26);
                    if (firstUser.content.length > 26) title += '...';
                }
            }

            const personaIcon = (PERSONAS.find(p => p.id === sess.persona) || PERSONAS[0]).icon;

            item.innerHTML = `
                <div class="session-title-wrap">
                    <span style="font-size:0.85rem; margin-right:2px;">${personaIcon}</span>
                    <span class="session-text">${escapeHtml(title)}</span>
                </div>
                <button class="btn-delete-session" title="Delete chat">
                    <i class="fa-regular fa-trash-can"></i>
                </button>
            `;

            item.querySelector('.session-title-wrap').addEventListener('click', () => {
                selectSession(sess.id);
            });

            item.querySelector('.btn-delete-session').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteSession(sess.id);
            });

            elements.sessionsList.appendChild(item);
        });
    }

    async function selectSession(sessionId) {
        try {
            const response = await fetch(`/api/sessions/${sessionId}`);
            if (!response.ok) return;
            const data = await response.json();
            state.sessionId = data.id;
            localStorage.setItem('nova_session_id', data.id);

            if (data.persona && data.persona !== state.persona) {
                selectPersona(data.persona);
            }

            renderMessages(data.messages || []);
            loadSessions();

            if (window.innerWidth <= 768) {
                elements.sidebar?.classList.remove('open');
                elements.sidebarOverlay?.classList.remove('show');
            }
        } catch (err) {
            // Handled
        }
    }

    async function deleteSession(sessionId) {
        try {
            await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
            if (state.sessionId === sessionId) {
                createNewChat();
            } else {
                loadSessions();
            }
            showToast('Chat deleted');
        } catch (err) {
            // Handled
        }
    }

    async function createNewChat() {
        state.sessionId = null;
        state.currentMessages = [];
        localStorage.removeItem('nova_session_id');
        renderMessages([]);
        loadSessions();
        if (elements.chatInput) {
            elements.chatInput.value = '';
            elements.chatInput.focus();
            handleInputChange();
        }
        if (window.innerWidth <= 768) {
            elements.sidebar?.classList.remove('open');
            elements.sidebarOverlay?.classList.remove('show');
        }
    }

    async function clearAllSessions() {
        if (!confirm('Are you sure you want to clear all conversation history?')) return;
        try {
            await fetch('/api/clear', { method: 'POST' });
            createNewChat();
            showToast('History cleared');
        } catch (err) {
            // Handled
        }
    }

    // Render Messages Feed
    function renderMessages(messages) {
        state.currentMessages = messages || [];
        if (!elements.messagesList) return;
        elements.messagesList.innerHTML = '';

        const hasUserMessage = state.currentMessages.some(m => m.role === 'user');
        if (!hasUserMessage) {
            renderWelcomeScreen(state.persona);
            if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'flex';
        } else {
            if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'none';
            messages.forEach((msg, idx) => appendMessageToFeed(msg, false, idx));
            scrollToBottom();
        }
    }

    function appendMessageToFeed(msg, scroll = true, msgIndex = -1) {
        if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'none';
        const item = document.createElement('div');
        item.className = `message-item ${msg.role}`;

        const isUser = msg.role === 'user';
        let formattedContent = '';
        if (isUser) {
            formattedContent = `<p>${escapeHtml(msg.content).replace(/\n/g, '<br>')}</p>`;
        } else {
            formattedContent = window.marked ? marked.parse(msg.content) : `<p>${escapeHtml(msg.content)}</p>`;
        }

        // ChatGPT Action Buttons
        const actionsHtml = isUser ? `
            <div class="message-actions user-actions">
                <button class="btn-msg-action btn-copy-msg" title="Copy text"><i class="fa-regular fa-copy"></i></button>
                <button class="btn-msg-action btn-edit-msg" title="Edit message"><i class="fa-regular fa-pen-to-square"></i></button>
            </div>
        ` : `
            <div class="message-actions">
                <button class="btn-msg-action btn-copy-msg" title="Copy response"><i class="fa-regular fa-copy"></i></button>
                <button class="btn-msg-action btn-regenerate-msg" title="Regenerate response"><i class="fa-solid fa-arrows-rotate"></i></button>
                <button class="btn-msg-action btn-like-msg" title="Good response"><i class="fa-regular fa-thumbs-up"></i></button>
                <button class="btn-msg-action btn-dislike-msg" title="Bad response"><i class="fa-regular fa-thumbs-down"></i></button>
                <button class="btn-msg-action btn-speak-msg" title="Read aloud"><i class="fa-solid fa-volume-high"></i></button>
            </div>
        `;

        item.innerHTML = `
            ${!isUser ? `<div class="message-avatar">${CHATGPT_SVG}</div>` : ''}
            <div class="message-content-wrapper">
                <div class="message-bubble">${formattedContent}</div>
                ${actionsHtml}
            </div>
        `;

        // User message actions
        if (isUser) {
            const copyBtn = item.querySelector('.btn-copy-msg');
            if (copyBtn) {
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(msg.content);
                    showToast('Copied to clipboard');
                });
            }

            const editBtn = item.querySelector('.btn-edit-msg');
            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    if (elements.chatInput) {
                        elements.chatInput.value = msg.content;
                        elements.chatInput.focus();
                        handleInputChange();
                        scrollToBottom();
                    }
                });
            }
        }

        // Assistant Message enhancements
        if (!isUser) {
            // Code block headers with syntax copy
            item.querySelectorAll('pre code').forEach((codeBlock) => {
                const pre = codeBlock.parentElement;
                const wrapper = document.createElement('div');
                wrapper.className = 'code-block-wrapper';

                const langMatch = codeBlock.className.match(/language-([a-zA-Z0-9]+)/);
                const langName = langMatch ? langMatch[1] : 'code';

                const header = document.createElement('div');
                header.className = 'code-header';
                header.innerHTML = `
                    <span>${langName}</span>
                    <button class="btn-copy-code"><i class="fa-regular fa-copy"></i> Copy code</button>
                `;

                header.querySelector('.btn-copy-code').addEventListener('click', () => {
                    navigator.clipboard.writeText(codeBlock.innerText);
                    const btn = header.querySelector('.btn-copy-code');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy code';
                    }, 2000);
                    showToast('Code copied to clipboard');
                });

                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(header);
                wrapper.appendChild(pre);
            });

            // Copy Response Action
            const copyMsgBtn = item.querySelector('.btn-copy-msg');
            if (copyMsgBtn) {
                copyMsgBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(msg.content);
                    copyMsgBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(() => { copyMsgBtn.innerHTML = '<i class="fa-regular fa-copy"></i>'; }, 1500);
                    showToast('Response copied to clipboard');
                });
            }

            // Regenerate Response Action
            const regenBtn = item.querySelector('.btn-regenerate-msg');
            if (regenBtn) {
                regenBtn.addEventListener('click', () => {
                    regenerateLastResponse();
                });
            }

            // Thumbs Up / Down toggles
            const likeBtn = item.querySelector('.btn-like-msg');
            const dislikeBtn = item.querySelector('.btn-dislike-msg');
            if (likeBtn && dislikeBtn) {
                likeBtn.addEventListener('click', () => {
                    likeBtn.classList.toggle('active');
                    dislikeBtn.classList.remove('active');
                });
                dislikeBtn.addEventListener('click', () => {
                    dislikeBtn.classList.toggle('active');
                    likeBtn.classList.remove('active');
                });
            }

            // Speak Action
            const speakBtn = item.querySelector('.btn-speak-msg');
            if (speakBtn) {
                speakBtn.addEventListener('click', () => {
                    speakText(msg.content, speakBtn);
                });
            }
        }

        elements.messagesList.appendChild(item);
        if (scroll) scrollToBottom();
    }

    function scrollToBottom() {
        if (elements.chatContainer) {
            elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
        }
    }

    // Regenerate last response
    function regenerateLastResponse() {
        if (state.isGenerating) return;
        const lastUserIndex = state.currentMessages.map(m => m.role).lastIndexOf('user');
        if (lastUserIndex === -1) return;

        const lastUserPrompt = state.currentMessages[lastUserIndex].content;
        
        // Remove trailing assistant response if any
        if (state.currentMessages.length > lastUserIndex + 1) {
            state.currentMessages = state.currentMessages.slice(0, lastUserIndex + 1);
            renderMessages(state.currentMessages);
        }

        sendMessage(lastUserPrompt, true);
    }

    // Text to Speech
    function speakText(text, btn) {
        if (!('speechSynthesis' in window)) {
            alert('Speech synthesis is not supported in your browser.');
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            return;
        }

        const plainText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.')
                              .replace(/[#*_`>~-]/g, '')
                              .trim();

        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 1.0;
        btn.innerHTML = '<i class="fa-solid fa-stop"></i>';

        utterance.onend = () => { btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>'; };
        utterance.onerror = () => { btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>'; };

        window.speechSynthesis.speak(utterance);
    }

    // Speech to Text (Voice typing)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            state.isRecording = true;
            elements.voiceInputBtn?.classList.add('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (elements.chatInput) {
                elements.chatInput.value += (elements.chatInput.value ? ' ' : '') + transcript;
                handleInputChange();
            }
        };

        recognition.onend = () => {
            state.isRecording = false;
            elements.voiceInputBtn?.classList.remove('recording');
        };

        recognition.onerror = () => {
            state.isRecording = false;
            elements.voiceInputBtn?.classList.remove('recording');
        };

        elements.voiceInputBtn?.addEventListener('click', () => {
            if (state.isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else if (elements.voiceInputBtn) {
        elements.voiceInputBtn.style.display = 'none';
    }

    // Stop Generation
    function stopGeneration() {
        if (state.abortController) {
            state.abortController.abort();
            state.abortController = null;
        }
        setGeneratingState(false);
    }

    function setGeneratingState(isGenerating) {
        state.isGenerating = isGenerating;
        if (!elements.sendBtn) return;

        if (isGenerating) {
            elements.sendBtn.innerHTML = '<i class="fa-solid fa-square"></i>';
            elements.sendBtn.classList.add('btn-stop');
            elements.sendBtn.title = 'Stop generating';
            elements.sendBtn.disabled = false;
            if (elements.typingIndicator) elements.typingIndicator.style.display = 'flex';
        } else {
            elements.sendBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
            elements.sendBtn.classList.remove('btn-stop');
            elements.sendBtn.title = 'Send message';
            if (elements.typingIndicator) elements.typingIndicator.style.display = 'none';
            handleInputChange();
        }
    }

    // Send Message
    async function sendMessage(customPrompt, isRegen = false) {
        if (state.isGenerating) {
            stopGeneration();
            return;
        }

        const text = customPrompt || (elements.chatInput ? elements.chatInput.value.trim() : '');
        if (!text) return;

        setGeneratingState(true);
        state.abortController = new AbortController();

        if (elements.chatInput && !isRegen) {
            elements.chatInput.value = '';
            elements.chatInput.style.height = 'auto';
            handleInputChange();
        }

        // Add User Message to UI if not regenerating
        if (!isRegen) {
            const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
            appendMessageToFeed(userMsg);
            state.currentMessages.push(userMsg);
        }

        scrollToBottom();

        try {
            const payload = {
                message: text,
                sessionId: state.sessionId,
                persona: state.persona,
                provider: state.provider,
                model: state.model,
                tone: state.tone,
                apiKey: state.apiKey,
                temperature: state.temperature
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: state.abortController.signal
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                throw new Error(errJson.reply || 'Server error ' + response.status);
            }

            const data = await response.json();
            state.sessionId = data.sessionId;
            localStorage.setItem('nova_session_id', data.sessionId);

            const assistantMsg = {
                role: 'assistant',
                content: data.reply,
                tokens: data.tokens,
                latencyMs: data.latencyMs,
                timestamp: data.timestamp
            };
            appendMessageToFeed(assistantMsg);
            state.currentMessages.push(assistantMsg);

            loadSessions();
        } catch (err) {
            if (err.name === 'AbortError') {
                showToast('Generation stopped');
            } else {
                const errorMsg = {
                    role: 'assistant',
                    content: `⚠️ **Error:** ${err.message}`,
                    tokens: 0,
                    latencyMs: 0
                };
                appendMessageToFeed(errorMsg);
            }
        } finally {
            setGeneratingState(false);
            state.abortController = null;
            scrollToBottom();
            elements.chatInput?.focus();
        }
    }

    // Input handlers
    function handleInputChange() {
        if (!elements.chatInput || !elements.sendBtn) return;
        if (state.isGenerating) return;

        const len = elements.chatInput.value.trim().length;
        elements.sendBtn.disabled = len === 0;

        elements.chatInput.style.height = 'auto';
        elements.chatInput.style.height = `${Math.min(elements.chatInput.scrollHeight, 180)}px`;
    }

    if (elements.chatInput) {
        elements.chatInput.addEventListener('input', handleInputChange);
        elements.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    if (elements.sendBtn) {
        elements.sendBtn.addEventListener('click', () => {
            if (state.isGenerating) {
                stopGeneration();
            } else {
                sendMessage();
            }
        });
    }

    // Top New Chat Button
    if (elements.topNewChatBtn) elements.topNewChatBtn.addEventListener('click', createNewChat);
    if (elements.newChatBtn) elements.newChatBtn.addEventListener('click', createNewChat);
    if (elements.clearAllBtn) elements.clearAllBtn.addEventListener('click', clearAllSessions);

    // Settings Modal
    if (elements.settingsModalBtn) {
        elements.settingsModalBtn.addEventListener('click', () => {
            if (elements.providerSelect) elements.providerSelect.value = state.provider;
            if (elements.apiKeyInput) elements.apiKeyInput.value = state.apiKey;
            if (elements.modelInput) elements.modelInput.value = state.model;
            if (elements.toneSelect) elements.toneSelect.value = state.tone;
            if (elements.tempSlider) elements.tempSlider.value = state.temperature;
            if (elements.tempValue) elements.tempValue.textContent = state.temperature;
            updateSettingsVisibility();
            elements.settingsModal?.classList.add('show');
        });
    }

    if (elements.closeSettingsModal) {
        elements.closeSettingsModal.addEventListener('click', () => {
            elements.settingsModal?.classList.remove('show');
        });
    }

    if (elements.tempSlider && elements.tempValue) {
        elements.tempSlider.addEventListener('input', (e) => {
            elements.tempValue.textContent = e.target.value;
        });
    }

    function updateSettingsVisibility() {
        const val = elements.providerSelect?.value;
        const needsKey = val === 'openai';
        if (elements.apiKeyGroup) elements.apiKeyGroup.style.display = needsKey ? 'flex' : 'none';
    }

    if (elements.providerSelect) {
        elements.providerSelect.addEventListener('change', updateSettingsVisibility);
    }

    if (elements.toggleApiKeyVisibility && elements.apiKeyInput) {
        elements.toggleApiKeyVisibility.addEventListener('click', () => {
            const isPassword = elements.apiKeyInput.type === 'password';
            elements.apiKeyInput.type = isPassword ? 'text' : 'password';
            elements.toggleApiKeyVisibility.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
        });
    }

    if (elements.saveSettingsBtn) {
        elements.saveSettingsBtn.addEventListener('click', () => {
            state.provider = elements.providerSelect.value;
            state.apiKey = elements.apiKeyInput.value.trim() || DEFAULT_KEY;
            state.model = elements.modelInput.value.trim() || (state.provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini');
            state.tone = elements.toneSelect.value;
            state.temperature = parseFloat(elements.tempSlider.value);

            localStorage.setItem('nova_provider', state.provider);
            localStorage.setItem('nova_api_key', state.apiKey);
            localStorage.setItem('nova_model', state.model);
            localStorage.setItem('nova_tone', state.tone);
            localStorage.setItem('nova_temperature', state.temperature);

            elements.settingsModal?.classList.remove('show');
            showToast('Settings saved');
        });
    }

    if (elements.resetSettingsBtn) {
        elements.resetSettingsBtn.addEventListener('click', () => {
            state.provider = 'gemini';
            state.apiKey = DEFAULT_KEY;
            state.model = 'gemini-2.5-flash';
            state.tone = 'detailed';
            state.temperature = 0.7;

            localStorage.removeItem('nova_provider');
            localStorage.removeItem('nova_api_key');
            localStorage.removeItem('nova_model');
            localStorage.removeItem('nova_tone');
            localStorage.removeItem('nova_temperature');

            if (elements.providerSelect) elements.providerSelect.value = 'gemini';
            if (elements.apiKeyInput) elements.apiKeyInput.value = DEFAULT_KEY;
            if (elements.modelInput) elements.modelInput.value = 'gemini-2.5-flash';
            if (elements.toneSelect) elements.toneSelect.value = 'detailed';
            if (elements.tempSlider) elements.tempSlider.value = 0.7;
            if (elements.tempValue) elements.tempValue.textContent = '0.7';

            updateSettingsVisibility();
            showToast('Settings reset to defaults');
        });
    }

    // Status / Diagnostics Modal
    if (elements.statusModalBtn) {
        elements.statusModalBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/status');
                if (res.ok) {
                    const data = await res.json();
                    if (elements.diagAppName) elements.diagAppName.textContent = (data.application || 'ChatGPT') + ' v' + (data.version || '1.0');
                    if (elements.diagJavaVersion) elements.diagJavaVersion.textContent = data.javaVersion || 'Ready';
                    if (elements.diagMemory) elements.diagMemory.textContent = `${data.usedMemoryMb || 0} MB / ${data.totalMemoryMb || 0} MB`;
                    if (elements.diagUptime) elements.diagUptime.textContent = `${data.uptimeSeconds || 0}s`;
                    if (elements.diagSessions) elements.diagSessions.textContent = data.activeSessions || 0;
                    if (elements.diagPersonas) elements.diagPersonas.textContent = data.availablePersonas || PERSONAS.length;
                }
            } catch (err) {
                // Handled
            }
            elements.statusModal?.classList.add('show');
        });
    }

    if (elements.closeStatusModal) {
        elements.closeStatusModal.addEventListener('click', () => {
            elements.statusModal?.classList.remove('show');
        });
    }

    // Export Modal
    if (elements.exportChatBtn) {
        elements.exportChatBtn.addEventListener('click', () => {
            elements.exportModal?.classList.add('show');
        });
    }

    if (elements.closeExportModal) {
        elements.closeExportModal.addEventListener('click', () => {
            elements.exportModal?.classList.remove('show');
        });
    }

    if (elements.exportMarkdownBtn) {
        elements.exportMarkdownBtn.addEventListener('click', () => {
            exportAsMarkdown();
            elements.exportModal?.classList.remove('show');
        });
    }

    if (elements.exportJsonBtn) {
        elements.exportJsonBtn.addEventListener('click', () => {
            exportAsJson();
            elements.exportModal?.classList.remove('show');
        });
    }

    function exportAsMarkdown() {
        if (!state.currentMessages || state.currentMessages.length === 0) {
            alert('No messages to export.');
            return;
        }

        const currentPersona = PERSONAS.find(p => p.id === state.persona) || PERSONAS[0];
        let md = `# ${currentPersona.name} Conversation\n\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
        state.currentMessages.forEach(msg => {
            const role = msg.role === 'user' ? '### 👤 You' : `### 🤖 ${currentPersona.name}`;
            md += `${role}\n\n${msg.content}\n\n---\n\n`;
        });

        downloadFile(md, `chatgpt-export-${Date.now()}.md`, 'text/markdown');
        showToast('Exported as Markdown');
    }

    function exportAsJson() {
        if (!state.currentMessages || state.currentMessages.length === 0) {
            alert('No messages to export.');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            sessionId: state.sessionId,
            persona: state.persona,
            messages: state.currentMessages
        };

        downloadFile(JSON.stringify(data, null, 2), `chatgpt-session-${Date.now()}.json`, 'application/json');
        showToast('Exported as JSON');
    }

    function downloadFile(content, fileName, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Global click listener for backdrop and outside clicks
    window.addEventListener('click', (e) => {
        // Close modals on backdrop click
        if (e.target === elements.settingsModal) elements.settingsModal?.classList.remove('show');
        if (e.target === elements.statusModal) elements.statusModal?.classList.remove('show');
        if (e.target === elements.exportModal) elements.exportModal?.classList.remove('show');

        // Close model dropdown if clicked outside
        if (elements.modelDropdown && elements.modelDropdown.classList.contains('show')) {
            if (!elements.modelDropdown.contains(e.target) && !elements.modelPillBtn.contains(e.target)) {
                closeModelDropdown();
            }
        }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        // Escape closes modals and dropdowns
        if (e.key === 'Escape') {
            elements.settingsModal?.classList.remove('show');
            elements.statusModal?.classList.remove('show');
            elements.exportModal?.classList.remove('show');
            closeModelDropdown();
        }

        // Ctrl+Shift+O / Cmd+Shift+O creates new chat
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
            e.preventDefault();
            createNewChat();
        }
    });

    // Initialize
    renderModelDropdown();
    if (state.sessionId) {
        selectSession(state.sessionId);
    } else {
        renderWelcomeScreen(state.persona);
        renderMessages([]);
        loadSessions();
    }
});
