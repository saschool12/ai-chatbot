document.addEventListener('DOMContentLoaded', () => {
    // State
    const state = {
        sessionId: localStorage.getItem('nova_session_id') || null,
        persona: localStorage.getItem('nova_persona') || 'general',
        provider: localStorage.getItem('nova_provider') || 'builtin',
        apiKey: localStorage.getItem('nova_api_key') || '',
        model: localStorage.getItem('nova_model') || '',
        temperature: parseFloat(localStorage.getItem('nova_temperature') || '0.7'),
        theme: localStorage.getItem('nova_theme') || 'dark',
        personas: [],
        currentMessages: [],
        isGenerating: false,
        isRecording: false
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
        personaList: document.getElementById('personaList'),
        sessionsList: document.getElementById('sessionsList'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        
        headerPersonaIcon: document.getElementById('headerPersonaIcon'),
        headerPersonaName: document.getElementById('headerPersonaName'),
        headerEngineBadge: document.getElementById('headerEngineBadge'),
        
        chatContainer: document.getElementById('chatContainer'),
        welcomeScreen: document.getElementById('welcomeScreen'),
        messagesList: document.getElementById('messagesList'),
        typingIndicator: document.getElementById('typingIndicator'),
        
        chatInput: document.getElementById('chatInput'),
        sendBtn: document.getElementById('sendBtn'),
        charCounter: document.getElementById('charCounter'),
        voiceInputBtn: document.getElementById('voiceInputBtn'),
        micIcon: document.getElementById('micIcon'),
        
        // Modals
        settingsModal: document.getElementById('settingsModal'),
        settingsModalBtn: document.getElementById('settingsModalBtn'),
        closeSettingsModal: document.getElementById('closeSettingsModal'),
        providerSelect: document.getElementById('providerSelect'),
        apiKeyGroup: document.getElementById('apiKeyGroup'),
        apiKeyInput: document.getElementById('apiKeyInput'),
        toggleApiKeyVisibility: document.getElementById('toggleApiKeyVisibility'),
        modelGroup: document.getElementById('modelGroup'),
        modelInput: document.getElementById('modelInput'),
        tempSlider: document.getElementById('tempSlider'),
        tempValue: document.getElementById('tempValue'),
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),
        resetSettingsBtn: document.getElementById('resetSettingsBtn'),
        
        statusModal: document.getElementById('statusModal'),
        statusModalBtn: document.getElementById('statusModalBtn'),
        closeStatusModal: document.getElementById('closeStatusModal'),
        diagAppName: document.getElementById('diagAppName'),
        diagJavaVersion: document.getElementById('diagJavaVersion'),
        diagMemory: document.getElementById('diagMemory'),
        diagUptime: document.getElementById('diagUptime'),
        diagSessions: document.getElementById('diagSessions'),
        diagPersonas: document.getElementById('diagPersonas'),
        
        exportModal: document.getElementById('exportModal'),
        exportChatBtn: document.getElementById('exportChatBtn'),
        closeExportModal: document.getElementById('closeExportModal'),
        exportMarkdownBtn: document.getElementById('exportMarkdownBtn'),
        exportJsonBtn: document.getElementById('exportJsonBtn')
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

    // Apply Initial Theme
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        state.theme = theme;
        localStorage.setItem('nova_theme', theme);
        if (theme === 'light') {
            elements.themeIcon.className = 'fa-solid fa-moon';
        } else {
            elements.themeIcon.className = 'fa-solid fa-sun';
        }
    }
    applyTheme(state.theme);

    elements.themeToggleBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // Mobile Sidebar
    elements.openSidebarBtn.addEventListener('click', () => {
        elements.sidebar.classList.add('open');
        elements.sidebarOverlay.classList.add('show');
    });

    const closeSidebar = () => {
        elements.sidebar.classList.remove('open');
        elements.sidebarOverlay.classList.remove('show');
    };
    elements.closeSidebarBtn.addEventListener('click', closeSidebar);
    elements.sidebarOverlay.addEventListener('click', closeSidebar);

    // Update Header Badges
    function updateHeaderInfo() {
        const persona = state.personas.find(p => p.id === state.persona) || {
            name: 'General Assistant',
            icon: '🤖'
        };
        elements.headerPersonaIcon.textContent = persona.icon;
        elements.headerPersonaName.textContent = persona.name;

        if (state.provider === 'openai') {
            elements.headerEngineBadge.textContent = 'OpenAI: ' + (state.model || 'gpt-4o-mini');
        } else if (state.provider === 'gemini') {
            elements.headerEngineBadge.textContent = 'Gemini: ' + (state.model || 'gemini-1.5-flash');
        } else {
            elements.headerEngineBadge.textContent = 'Built-in Neural Engine';
        }
    }

    // Load Personas
    async function loadPersonas() {
        try {
            const res = await fetch('/api/personas');
            if (!res.ok) throw new Error('Failed to load personas');
            state.personas = await res.json();
            renderPersonas();
            updateHeaderInfo();
        } catch (err) {
            console.error(err);
        }
    }

    function renderPersonas() {
        elements.personaList.innerHTML = '';
        state.personas.forEach(p => {
            const btn = document.createElement('button');
            btn.className = `persona-item ${p.id === state.persona ? 'active' : ''}`;
            btn.innerHTML = `
                <span class="persona-icon">${p.icon}</span>
                <span>${p.name}</span>
            `;
            btn.addEventListener('click', () => {
                selectPersona(p.id);
            });
            elements.personaList.appendChild(btn);
        });
    }

    function selectPersona(personaId) {
        state.persona = personaId;
        localStorage.setItem('nova_persona', personaId);
        renderPersonas();
        updateHeaderInfo();
        // Start fresh conversation with this persona
        createNewChat();
    }

    // Load Sessions
    async function loadSessions() {
        try {
            const res = await fetch('/api/sessions');
            if (!res.ok) return;
            const sessions = await res.json();
            renderSessions(sessions);
        } catch (err) {
            console.error(err);
        }
    }

    function renderSessions(sessions) {
        elements.sessionsList.innerHTML = '';
        if (sessions.length === 0) {
            elements.sessionsList.innerHTML = '<span style="font-size:0.75rem; color:var(--text-muted); padding: 0.5rem 0.75rem;">No recent chats</span>';
            return;
        }

        sessions.forEach(sess => {
            const div = document.createElement('div');
            div.className = `session-item ${sess.id === state.sessionId ? 'active' : ''}`;
            div.innerHTML = `
                <span class="session-title"><i class="fa-regular fa-message" style="margin-right: 6px; font-size:0.75rem;"></i>${escapeHtml(sess.title)}</span>
                <button class="btn-delete-session" title="Delete conversation"><i class="fa-solid fa-xmark"></i></button>
            `;

            div.querySelector('.session-title').addEventListener('click', () => {
                openSession(sess.id);
                closeSidebar();
            });

            div.querySelector('.btn-delete-session').addEventListener('click', async (e) => {
                e.stopPropagation();
                await deleteSession(sess.id);
            });

            elements.sessionsList.appendChild(div);
        });
    }

    async function openSession(id) {
        try {
            const res = await fetch(`/api/sessions/${id}`);
            if (!res.ok) return;
            const session = await res.json();
            state.sessionId = session.id;
            state.persona = session.persona || 'general';
            localStorage.setItem('nova_session_id', session.id);
            localStorage.setItem('nova_persona', state.persona);

            renderPersonas();
            updateHeaderInfo();
            renderMessages(session.messages);
            loadSessions();
        } catch (err) {
            console.error(err);
        }
    }

    async function createNewChat() {
        try {
            const res = await fetch(`/api/sessions?persona=${encodeURIComponent(state.persona)}`, {
                method: 'POST'
            });
            if (!res.ok) throw new Error('Failed to create session');
            const session = await res.json();
            state.sessionId = session.id;
            localStorage.setItem('nova_session_id', session.id);
            renderMessages(session.messages);
            loadSessions();
            closeSidebar();
        } catch (err) {
            console.error(err);
        }
    }

    async function deleteSession(id) {
        try {
            await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
            if (state.sessionId === id) {
                createNewChat();
            } else {
                loadSessions();
            }
        } catch (err) {
            console.error(err);
        }
    }

    async function clearAllSessions() {
        if (!confirm('Are you sure you want to clear all conversation history?')) return;
        try {
            await fetch('/api/clear', { method: 'POST' });
            createNewChat();
        } catch (err) {
            console.error(err);
        }
    }

    // Render Messages Feed
    function renderMessages(messages) {
        state.currentMessages = messages || [];
        elements.messagesList.innerHTML = '';

        if (!messages || messages.length === 0) {
            elements.welcomeScreen.style.display = 'flex';
        } else {
            elements.welcomeScreen.style.display = 'none';
            messages.forEach(msg => appendMessageToFeed(msg, false));
            scrollToBottom();
        }
    }

    function appendMessageToFeed(msg, scroll = true) {
        elements.welcomeScreen.style.display = 'none';
        const item = document.createElement('div');
        item.className = `message-item ${msg.role}`;

        const isUser = msg.role === 'user';
        const avatar = isUser ? '<i class="fa-solid fa-user"></i>' : (state.personas.find(p => p.id === state.persona)?.icon || '⚡');

        let formattedContent = '';
        if (isUser) {
            formattedContent = `<p>${escapeHtml(msg.content).replace(/\n/g, '<br>')}</p>`;
        } else {
            // Assistant reply parsed as markdown
            formattedContent = marked.parse(msg.content);
        }

        const metaTokens = msg.tokens ? `${msg.tokens} tokens` : '';
        const metaLatency = msg.latencyMs ? ` • ${msg.latencyMs}ms` : '';
        const metaHtml = !isUser ? `
            <div class="message-meta">
                <span>${metaTokens}${metaLatency}</span>
                <button class="btn-meta-action btn-copy-msg" title="Copy full response"><i class="fa-regular fa-copy"></i></button>
                <button class="btn-meta-action btn-speak-msg" title="Read aloud"><i class="fa-solid fa-volume-high"></i></button>
            </div>
        ` : '';

        item.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content-wrapper">
                <div class="message-bubble">${formattedContent}</div>
                ${metaHtml}
            </div>
        `;

        // Wrap pre > code blocks with syntax copy headers
        if (!isUser) {
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
                    <button class="btn-copy-code"><i class="fa-regular fa-copy"></i> Copy</button>
                `;

                header.querySelector('.btn-copy-code').addEventListener('click', () => {
                    navigator.clipboard.writeText(codeBlock.innerText);
                    const btn = header.querySelector('.btn-copy-code');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy';
                    }, 2000);
                });

                pre.parentNode.insertBefore(wrapper, pre);
                wrapper.appendChild(header);
                wrapper.appendChild(pre);
            });

            // Action: Copy full message
            const copyMsgBtn = item.querySelector('.btn-copy-msg');
            if (copyMsgBtn) {
                copyMsgBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(msg.content);
                    copyMsgBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(() => { copyMsgBtn.innerHTML = '<i class="fa-regular fa-copy"></i>'; }, 1500);
                });
            }

            // Action: Text to Speech
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
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
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

        // Clean markdown tags for clean audio speech
        const plainText = text.replace(/```[\s\S]*?```/g, 'Code block omitted.')
                              .replace(/[#*_`>~-]/g, '')
                              .trim();

        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        btn.innerHTML = '<i class="fa-solid fa-stop"></i>';

        utterance.onend = () => {
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        };
        utterance.onerror = () => {
            btn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        };

        window.speechSynthesis.speak(utterance);
    }

    // Speech to Text (Microphone)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            state.isRecording = true;
            elements.voiceInputBtn.classList.add('recording');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.chatInput.value += (elements.chatInput.value ? ' ' : '') + transcript;
            handleInputChange();
        };

        recognition.onend = () => {
            state.isRecording = false;
            elements.voiceInputBtn.classList.remove('recording');
        };

        recognition.onerror = (e) => {
            console.error('Speech recognition error:', e);
            state.isRecording = false;
            elements.voiceInputBtn.classList.remove('recording');
        };

        elements.voiceInputBtn.addEventListener('click', () => {
            if (state.isRecording) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    } else {
        elements.voiceInputBtn.style.display = 'none';
    }

    // Send Message
    async function sendMessage(customPrompt) {
        const text = customPrompt || elements.chatInput.value.trim();
        if (!text || state.isGenerating) return;

        state.isGenerating = true;
        elements.chatInput.value = '';
        elements.chatInput.style.height = 'auto';
        handleInputChange();

        // 1. Add User Message
        const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
        appendMessageToFeed(userMsg);
        state.currentMessages.push(userMsg);

        // 2. Show Typing Indicator
        elements.typingIndicator.style.display = 'flex';
        scrollToBottom();

        try {
            const payload = {
                message: text,
                sessionId: state.sessionId,
                persona: state.persona,
                provider: state.provider,
                model: state.model,
                apiKey: state.apiKey,
                temperature: state.temperature
            };

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                throw new Error(errJson.reply || 'Server error ' + response.status);
            }

            const data = await response.json();
            state.sessionId = data.sessionId;
            localStorage.setItem('nova_session_id', data.sessionId);

            // 3. Add Assistant Message
            const assistantMsg = {
                role: 'assistant',
                content: data.reply,
                tokens: data.tokens,
                latencyMs: data.latencyMs,
                timestamp: data.timestamp
            };
            appendMessageToFeed(assistantMsg);
            state.currentMessages.push(assistantMsg);

            // Refresh recent chat titles
            loadSessions();
        } catch (err) {
            const errorMsg = {
                role: 'assistant',
                content: `⚠️ **Error:** ${err.message}`,
                tokens: 0,
                latencyMs: 0
            };
            appendMessageToFeed(errorMsg);
        } finally {
            state.isGenerating = false;
            elements.typingIndicator.style.display = 'none';
            scrollToBottom();
            elements.chatInput.focus();
        }
    }

    // Input handlers
    function handleInputChange() {
        const len = elements.chatInput.value.length;
        elements.charCounter.textContent = `${len} / 2000`;
        elements.sendBtn.disabled = len === 0;

        // Auto resize height
        elements.chatInput.style.height = 'auto';
        elements.chatInput.style.height = `${Math.min(elements.chatInput.scrollHeight, 180)}px`;
    }

    elements.chatInput.addEventListener('input', handleInputChange);

    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    elements.sendBtn.addEventListener('click', () => sendMessage());

    // Starter Prompt Cards
    document.querySelectorAll('.starter-card').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            sendMessage(prompt);
        });
    });

    // Top action buttons
    elements.newChatBtn.addEventListener('click', createNewChat);
    elements.clearAllBtn.addEventListener('click', clearAllSessions);

    // Settings Modal
    elements.settingsModalBtn.addEventListener('click', () => {
        elements.providerSelect.value = state.provider;
        elements.apiKeyInput.value = state.apiKey;
        elements.modelInput.value = state.model;
        elements.tempSlider.value = state.temperature;
        elements.tempValue.textContent = state.temperature;
        updateSettingsVisibility();
        elements.settingsModal.classList.add('show');
    });

    elements.closeSettingsModal.addEventListener('click', () => {
        elements.settingsModal.classList.remove('show');
    });

    function updateSettingsVisibility() {
        const val = elements.providerSelect.value;
        const needsKey = val === 'openai' || val === 'gemini';
        elements.apiKeyGroup.style.display = needsKey ? 'flex' : 'none';
        elements.modelGroup.style.display = needsKey ? 'flex' : 'none';
    }

    elements.providerSelect.addEventListener('change', updateSettingsVisibility);

    elements.tempSlider.addEventListener('input', (e) => {
        elements.tempValue.textContent = e.target.value;
    });

    elements.toggleApiKeyVisibility.addEventListener('click', () => {
        const isPassword = elements.apiKeyInput.type === 'password';
        elements.apiKeyInput.type = isPassword ? 'text' : 'password';
        elements.toggleApiKeyVisibility.innerHTML = isPassword ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
    });

    elements.saveSettingsBtn.addEventListener('click', () => {
        state.provider = elements.providerSelect.value;
        state.apiKey = elements.apiKeyInput.value.trim();
        state.model = elements.modelInput.value.trim();
        state.temperature = parseFloat(elements.tempSlider.value);

        localStorage.setItem('nova_provider', state.provider);
        localStorage.setItem('nova_api_key', state.apiKey);
        localStorage.setItem('nova_model', state.model);
        localStorage.setItem('nova_temperature', state.temperature);

        updateHeaderInfo();
        elements.settingsModal.classList.remove('show');
    });

    elements.resetSettingsBtn.addEventListener('click', () => {
        state.provider = 'builtin';
        state.apiKey = '';
        state.model = '';
        state.temperature = 0.7;

        localStorage.removeItem('nova_provider');
        localStorage.removeItem('nova_api_key');
        localStorage.removeItem('nova_model');
        localStorage.removeItem('nova_temperature');

        elements.providerSelect.value = 'builtin';
        elements.apiKeyInput.value = '';
        elements.modelInput.value = '';
        elements.tempSlider.value = 0.7;
        elements.tempValue.textContent = '0.7';
        updateSettingsVisibility();
        updateHeaderInfo();
    });

    // Status / Diagnostics Modal
    elements.statusModalBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/status');
            if (res.ok) {
                const data = await res.json();
                elements.diagAppName.textContent = data.application + ' v' + data.version;
                elements.diagJavaVersion.textContent = data.javaVersion;
                elements.diagMemory.textContent = `${data.usedMemoryMb} MB / ${data.totalMemoryMb} MB`;
                elements.diagUptime.textContent = `${data.uptimeSeconds}s`;
                elements.diagSessions.textContent = data.activeSessions;
                elements.diagPersonas.textContent = data.availablePersonas;
            }
        } catch (err) {
            console.error(err);
        }
        elements.statusModal.classList.add('show');
    });

    elements.closeStatusModal.addEventListener('click', () => {
        elements.statusModal.classList.remove('show');
    });

    // Export Modal
    elements.exportChatBtn.addEventListener('click', () => {
        elements.exportModal.classList.add('show');
    });

    elements.closeExportModal.addEventListener('click', () => {
        elements.exportModal.classList.remove('show');
    });

    elements.exportMarkdownBtn.addEventListener('click', () => {
        let md = `# NovaAI Conversation Export\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
        state.currentMessages.forEach(m => {
            const sender = m.role === 'user' ? '### 👤 User' : '### ⚡ NovaAI';
            md += `${sender} (${m.timestamp || ''})\n\n${m.content}\n\n---\n\n`;
        });
        downloadFile(`conversation-${Date.now()}.md`, md, 'text/markdown');
        elements.exportModal.classList.remove('show');
    });

    elements.exportJsonBtn.addEventListener('click', () => {
        const json = JSON.stringify({
            sessionId: state.sessionId,
            persona: state.persona,
            exportedAt: new Date().toISOString(),
            messages: state.currentMessages
        }, null, 2);
        downloadFile(`conversation-${Date.now()}.json`, json, 'application/json');
        elements.exportModal.classList.remove('show');
    });

    function downloadFile(filename, content, type) {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Close modals on clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) elements.settingsModal.classList.remove('show');
        if (e.target === elements.statusModal) elements.statusModal.classList.remove('show');
        if (e.target === elements.exportModal) elements.exportModal.classList.remove('show');
    });

    function escapeHtml(text) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text ? text.replace(/[&<>"']/g, m => map[m]) : '';
    }

    // Startup Initialization
    async function init() {
        await loadPersonas();
        await loadSessions();

        if (state.sessionId) {
            await openSession(state.sessionId);
        } else {
            await createNewChat();
        }
    }

    init();
});
