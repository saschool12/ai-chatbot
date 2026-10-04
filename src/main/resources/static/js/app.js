document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_KEY = '';

    // ChatGPT SVG Avatar
    const CHATGPT_SVG = `
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.5973 8.3829l2.02-1.164a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4018-.5816zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1639a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813v6.7227zm1.1458-1.9213l2.552-1.472a.79.79 0 0 0 .3927-.6813V5.8452l2.552 1.472a.071.071 0 0 1 .038.0615v2.944a.79.79 0 0 0 .3927.6813l2.552 1.472-2.552 1.472a.79.79 0 0 0-.3927.6813v2.944a.071.071 0 0 1-.038.0615l-2.552-1.472a.79.79 0 0 0-.3927-.6813v-2.944a.79.79 0 0 0-.3927-.6813z"/>
        </svg>
    `;

    // State
    const state = {
        sessionId: localStorage.getItem('nova_session_id') || null,
        persona: 'general',
        provider: localStorage.getItem('nova_provider') || 'gemini',
        apiKey: localStorage.getItem('nova_api_key') || DEFAULT_KEY,
        model: localStorage.getItem('nova_model') || 'gemini-2.5-flash',
        temperature: 0.7,
        theme: localStorage.getItem('nova_theme') || 'dark',
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
        topNewChatBtn: document.getElementById('topNewChatBtn'),
        sessionsList: document.getElementById('sessionsList'),
        clearAllBtn: document.getElementById('clearAllBtn'),
        
        chatContainer: document.getElementById('chatContainer'),
        welcomeScreen: document.getElementById('welcomeScreen'),
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
        saveSettingsBtn: document.getElementById('saveSettingsBtn'),
        resetSettingsBtn: document.getElementById('resetSettingsBtn'),
        
        // Export Modal
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
                    title = firstUser.content.trim().slice(0, 28);
                    if (firstUser.content.length > 28) title += '...';
                }
            }

            item.innerHTML = `
                <div class="session-title-wrap">
                    <i class="fa-regular fa-message"></i>
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
            if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'flex';
        } else {
            if (elements.welcomeScreen) elements.welcomeScreen.style.display = 'none';
            messages.forEach(msg => appendMessageToFeed(msg, false));
            scrollToBottom();
        }
    }

    function appendMessageToFeed(msg, scroll = true) {
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

        // ChatGPT Action Buttons below response
        const actionsHtml = !isUser ? `
            <div class="message-actions">
                <button class="btn-msg-action btn-copy-msg" title="Copy response"><i class="fa-regular fa-copy"></i></button>
                <button class="btn-msg-action btn-like-msg" title="Good response"><i class="fa-regular fa-thumbs-up"></i></button>
                <button class="btn-msg-action btn-dislike-msg" title="Bad response"><i class="fa-regular fa-thumbs-down"></i></button>
                <button class="btn-msg-action btn-speak-msg" title="Read aloud"><i class="fa-solid fa-volume-high"></i></button>
            </div>
        ` : '';

        item.innerHTML = `
            ${!isUser ? `<div class="message-avatar">${CHATGPT_SVG}</div>` : ''}
            <div class="message-content-wrapper">
                <div class="message-bubble">${formattedContent}</div>
                ${actionsHtml}
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
                    <button class="btn-copy-code"><i class="fa-regular fa-copy"></i> Copy code</button>
                `;

                header.querySelector('.btn-copy-code').addEventListener('click', () => {
                    navigator.clipboard.writeText(codeBlock.innerText);
                    const btn = header.querySelector('.btn-copy-code');
                    btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy code';
                    }, 2000);
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

    // Send Message
    async function sendMessage(customPrompt) {
        const text = customPrompt || (elements.chatInput ? elements.chatInput.value.trim() : '');
        if (!text || state.isGenerating) return;

        state.isGenerating = true;
        if (elements.chatInput) {
            elements.chatInput.value = '';
            elements.chatInput.style.height = 'auto';
            handleInputChange();
        }

        // Add User Message to UI
        const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
        appendMessageToFeed(userMsg);
        state.currentMessages.push(userMsg);

        // Show Typing Indicator
        if (elements.typingIndicator) elements.typingIndicator.style.display = 'flex';
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
            const errorMsg = {
                role: 'assistant',
                content: `⚠️ **Error:** ${err.message}`,
                tokens: 0,
                latencyMs: 0
            };
            appendMessageToFeed(errorMsg);
        } finally {
            state.isGenerating = false;
            if (elements.typingIndicator) elements.typingIndicator.style.display = 'none';
            scrollToBottom();
            elements.chatInput?.focus();
        }
    }

    // Input handlers
    function handleInputChange() {
        if (!elements.chatInput || !elements.sendBtn) return;
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
        elements.sendBtn.addEventListener('click', () => sendMessage());
    }

    // Top New Chat Button
    if (elements.topNewChatBtn) {
        elements.topNewChatBtn.addEventListener('click', createNewChat);
    }

    // Starter Prompt Chips
    document.querySelectorAll('.starter-chip').forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            sendMessage(prompt);
        });
    });

    if (elements.newChatBtn) elements.newChatBtn.addEventListener('click', createNewChat);
    if (elements.clearAllBtn) elements.clearAllBtn.addEventListener('click', clearAllSessions);

    // Settings Modal
    if (elements.settingsModalBtn) {
        elements.settingsModalBtn.addEventListener('click', () => {
            if (elements.providerSelect) elements.providerSelect.value = state.provider;
            if (elements.apiKeyInput) elements.apiKeyInput.value = state.apiKey;
            updateSettingsVisibility();
            elements.settingsModal?.classList.add('show');
        });
    }

    if (elements.closeSettingsModal) {
        elements.closeSettingsModal.addEventListener('click', () => {
            elements.settingsModal?.classList.remove('show');
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

            localStorage.setItem('nova_provider', state.provider);
            localStorage.setItem('nova_api_key', state.apiKey);

            elements.settingsModal?.classList.remove('show');
        });
    }

    if (elements.resetSettingsBtn) {
        elements.resetSettingsBtn.addEventListener('click', () => {
            state.provider = 'gemini';
            state.apiKey = DEFAULT_KEY;

            localStorage.removeItem('nova_provider');
            localStorage.removeItem('nova_api_key');

            if (elements.providerSelect) elements.providerSelect.value = 'gemini';
            if (elements.apiKeyInput) elements.apiKeyInput.value = DEFAULT_KEY;
            updateSettingsVisibility();
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

        let md = `# ChatGPT Conversation\n\n*Exported on ${new Date().toLocaleString()}*\n\n---\n\n`;
        state.currentMessages.forEach(msg => {
            const role = msg.role === 'user' ? '### 👤 You' : '### 🤖 ChatGPT';
            md += `${role}\n\n${msg.content}\n\n---\n\n`;
        });

        downloadFile(md, `chatgpt-export-${Date.now()}.md`, 'text/markdown');
    }

    function exportAsJson() {
        if (!state.currentMessages || state.currentMessages.length === 0) {
            alert('No messages to export.');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            sessionId: state.sessionId,
            messages: state.currentMessages
        };

        downloadFile(JSON.stringify(data, null, 2), `chatgpt-session-${Date.now()}.json`, 'application/json');
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

    // Initialize
    if (state.sessionId) {
        selectSession(state.sessionId);
    } else {
        renderMessages([]);
        loadSessions();
    }
});
