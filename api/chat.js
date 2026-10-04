const { getOrCreateSession, addMessage, generateReply, PERSONAS } = require('./_store');

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
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
  const session = getOrCreateSession(body.sessionId, personaId);
  const sessionId = session.id;

  // Add user message
  const userTokens = estimateTokens(message);
  addMessage(sessionId, {
    role: 'user',
    content: message,
    tokens: userTokens,
    latencyMs: 0,
    timestamp: new Date().toISOString()
  });

  let provider = (body.provider || 'builtin').toLowerCase();
  let model = body.model || 'neural-expert-v1';
  let replyText = null;

  try {
    if (provider === 'openai' && body.apiKey) {
      const personaObj = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
      const messages = [
        { role: 'system', content: personaObj.systemPrompt },
        ...session.messages.slice(-8).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: message }
      ];

      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${body.apiKey}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: messages,
          temperature: body.temperature || 0.7
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `OpenAI returned HTTP ${resp.status}`);
      }

      const data = await resp.json();
      replyText = data.choices?.[0]?.message?.content || 'No response from OpenAI.';
    } else if (provider === 'gemini' && body.apiKey) {
      const geminiModel = model || 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${body.apiKey}`;
      const personaObj = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
      
      const prompt = `${personaObj.systemPrompt}\n\nUser: ${message}`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error?.message || `Gemini returned HTTP ${resp.status}`);
      }

      const data = await resp.json();
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    } else {
      provider = 'builtin';
      model = 'Nova-Neural-v1';
      replyText = generateReply(message, personaId);
    }
  } catch (err) {
    replyText = `⚠️ **Error connecting to AI service:** ${err.message}\n\n*Falling back to Built-in Engine:*\n\n${generateReply(message, personaId)}`;
    provider = 'builtin (fallback)';
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
