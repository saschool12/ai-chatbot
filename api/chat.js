const { getOrCreateSession, addMessage, generateReply, PERSONAS } = require('./_store');
const DEFAULT_GEMINI_KEY = process.env.GEMINI_API_KEY || '';

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

async function callGemini(apiKey, model, systemPrompt, history, userMessage) {
  if (!apiKey || !apiKey.trim()) return null;
  const modelsToTry = [model, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-flash-lite-latest'].filter(Boolean);
  
  for (const mod of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${mod}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
      const contents = [];
      const recent = (history || []).slice(-6);
      for (const m of recent) {
        contents.push({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const body = {
        contents: contents,
        system_instruction: {
          parts: [{ text: systemPrompt }]
        }
      };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!resp.ok) continue;
      const data = await resp.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (e) {
      // try next model
    }
  }
  return null;
}

async function callFreeLlm(messages, systemPrompt) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const formattedMessages = [
      { role: 'system', content: `${systemPrompt}\n\nFormatting: Use clean, concise, modern markdown. Be direct, intelligent, and insightful.` },
      ...messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
    ];

    const resp = await fetch('https://text.pollinations.ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: formattedMessages,
        model: 'openai',
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    clearTimeout(timeoutId);
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();
  const body = req.body || {};
  const message = body.message;

  if (!message || !message.trim()) {
    return res.status(400).json({
      reply: 'Message cannot be empty.',
      sessionId: body.sessionId || null,
      persona: body.persona || 'general',
      provider: 'system',
      model: 'none',
      tokens: 0,
      latencyMs: 0
    });
  }

  const personaId = body.persona || 'general';
  const personaObj = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
  const session = getOrCreateSession(body.sessionId, personaId);
  const sessionId = session.id;

  const tone = body.tone || 'detailed';
  let systemPrompt = personaObj.systemPrompt;
  if (tone === 'concise') {
    systemPrompt += '\n\nTone: Direct, ultra-concise, and to the point. Omit unnecessary preamble.';
  } else if (tone === 'technical') {
    systemPrompt += '\n\nTone: Senior Staff Engineer. Provide deep technical explanations, production-ready code, edge cases, and architectural considerations.';
  } else if (tone === 'mentor') {
    systemPrompt += '\n\nTone: Friendly, encouraging mentor. Break concepts down into intuitive, step-by-step explanations with analogies.';
  } else {
    systemPrompt += '\n\nTone: Intelligent, natural, insightful, and formatted with clean markdown.';
  }

  // Add user message
  const userTokens = estimateTokens(message);
  const userMsg = {
    role: 'user',
    content: message,
    tokens: userTokens,
    latencyMs: 0,
    timestamp: new Date().toISOString()
  };
  addMessage(sessionId, userMsg);

  let provider = (body.provider || 'gemini').toLowerCase();
  let model = body.model || 'gemini-2.5-flash';
  let replyText = null;

  try {
    if (provider === 'builtin') {
      replyText = generateReply(message, personaId);
      provider = 'builtin';
      model = 'Nova-Neural-v1';
    } else {
      if (provider === 'openai' && body.apiKey && body.apiKey.trim()) {
        const messages = [
          { role: 'system', content: systemPrompt },
          ...session.messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ];

        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${body.apiKey.trim()}`
          },
          body: JSON.stringify({
            model: body.model || 'gpt-4o-mini',
            messages: messages,
            temperature: body.temperature || 0.7
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          replyText = data.choices?.[0]?.message?.content;
        }
      }

      if (!replyText) {
        // Primary: Google Gemini
        const geminiKey = (body.apiKey && body.apiKey.trim()) ? body.apiKey.trim() : DEFAULT_GEMINI_KEY;
        if (geminiKey) {
          replyText = await callGemini(geminiKey, model, systemPrompt, session.messages, message);
          if (replyText) {
            provider = 'gemini';
            model = model || 'gemini-2.5-flash';
          }
        }
      }

      if (!replyText) {
        // Secondary: Free OpenAI-compatible LLM
        const historyWithNew = [...session.messages.slice(-6), userMsg];
        replyText = await callFreeLlm(historyWithNew, systemPrompt);
        if (replyText) {
          provider = 'nova-smart';
          model = 'Nova-Pro-v1';
        }
      }

      if (!replyText) {
        // Tertiary: Built-in local rule engine
        replyText = generateReply(message, personaId);
        provider = 'builtin';
        model = 'Nova-Neural-v1';
      }
    }
  } catch (err) {
    replyText = generateReply(message, personaId);
    provider = 'builtin (fallback)';
    model = 'Nova-Neural-v1';
  }

  const latencyMs = Date.now() - startTime;
  const replyTokens = estimateTokens(replyText);

  // Add assistant message
  addMessage(sessionId, {
    role: 'assistant',
    content: replyText,
    tokens: replyTokens,
    latencyMs: latencyMs,
    timestamp: new Date().toISOString()
  });

  return res.status(200).json({
    reply: replyText,
    sessionId: sessionId,
    persona: personaId,
    provider: provider,
    model: model,
    tokens: replyTokens,
    latencyMs: latencyMs,
    timestamp: new Date().toISOString()
  });
};
