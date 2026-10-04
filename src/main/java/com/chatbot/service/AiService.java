package com.chatbot.service;

import com.chatbot.model.ChatMessage;
import com.chatbot.model.ChatRequest;
import com.chatbot.model.ChatResponse;
import com.chatbot.model.ChatSession;
import com.chatbot.model.Persona;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AiService {
    private final BuiltInAiEngine builtInEngine;
    private final ExternalLlmService externalLlmService;
    private final SessionService sessionService;
    private final Map<String, Persona> personas = new LinkedHashMap<>();

    public AiService(BuiltInAiEngine builtInEngine, ExternalLlmService externalLlmService, SessionService sessionService) {
        this.builtInEngine = builtInEngine;
        this.externalLlmService = externalLlmService;
        this.sessionService = sessionService;
        initPersonas();
    }

    private void initPersonas() {
        personas.put("general", new Persona(
                "general",
                "General Assistant",
                "🤖",
                "Versatile, smart, and comprehensive AI companion.",
                "You are NovaAI, a helpful, polite, and intelligent AI assistant."
        ));

        personas.put("coder", new Persona(
                "coder",
                "Code Master",
                "💻",
                "Specialist in Java, Spring Boot, architecture, and algorithms.",
                "You are Code Master, an elite software architect and senior developer expert in Java, clean code, design patterns, and debugging."
        ));

        personas.put("science", new Persona(
                "science",
                "Science & Math Tutor",
                "🔬",
                "Explains complex physics, math formulas, and scientific theories.",
                "You are a patient and rigorous STEM tutor who explains mathematics, physics, and science with clarity and precision."
        ));

        personas.put("writer", new Persona(
                "writer",
                "Creative Writer",
                "✍️",
                "Crafts captivating stories, poetry, and persuasive copy.",
                "You are an inspiring creative author, poet, and copywriter with vivid storytelling ability."
        ));

        personas.put("career", new Persona(
                "career",
                "Career & Business Coach",
                "💼",
                "Resume polish, interview preparation, and business strategy.",
                "You are an executive career mentor helping candidates excel in interviews, resume drafting, and tech strategy."
        ));
    }

    public List<Persona> getPersonas() {
        return new ArrayList<>(personas.values());
    }

    public Persona getPersona(String id) {
        return personas.getOrDefault(id != null ? id.toLowerCase() : "general", personas.get("general"));
    }

    public ChatResponse processChat(ChatRequest request) {
        long startTime = System.currentTimeMillis();

        String personaId = request.getPersona() != null ? request.getPersona() : "general";
        Persona persona = getPersona(personaId);
        String sessionId = request.getSessionId();

        ChatSession session = sessionService.getOrCreateSession(sessionId, personaId);
        sessionId = session.getId();

        // 1. Record user message
        int userTokens = estimateTokens(request.getMessage());
        ChatMessage userMsg = new ChatMessage("user", request.getMessage(), userTokens, 0);
        sessionService.addMessage(sessionId, userMsg);

        // 2. Determine reply using requested provider
        String provider = request.getProvider() != null ? request.getProvider().toLowerCase() : "builtin";
        String model = request.getModel() != null ? request.getModel() : "neural-expert-v1";
        String replyText;

        try {
            if ("openai".equals(provider) && request.getApiKey() != null && !request.getApiKey().isBlank()) {
                replyText = externalLlmService.callOpenAiCompatible(
                        request.getApiKey(),
                        model,
                        persona.getSystemPrompt(),
                        session.getMessages(),
                        request.getMessage(),
                        request.getTemperature()
                );
            } else if ("gemini".equals(provider) && request.getApiKey() != null && !request.getApiKey().isBlank()) {
                replyText = externalLlmService.callGemini(
                        request.getApiKey(),
                        model,
                        persona.getSystemPrompt(),
                        session.getMessages(),
                        request.getMessage()
                );
            } else {
                // Built-in intelligent engine
                provider = "builtin";
                model = "Nova-Neural-v1";
                replyText = builtInEngine.generateReply(request.getMessage(), personaId, session.getMessages());
            }
        } catch (Exception e) {
            replyText = "⚠️ **Error connecting to AI service:** " + e.getMessage() + "\n\n*Falling back to Built-in Engine:*\n\n" +
                    builtInEngine.generateReply(request.getMessage(), personaId, session.getMessages());
            provider = "builtin (fallback)";
        }

        long latencyMs = System.currentTimeMillis() - startTime;
        int replyTokens = estimateTokens(replyText);

        // 3. Record assistant message
        ChatMessage assistantMsg = new ChatMessage("assistant", replyText, replyTokens, latencyMs);
        sessionService.addMessage(sessionId, assistantMsg);

        return new ChatResponse(replyText, sessionId, personaId, provider, model, replyTokens, latencyMs);
    }

    private int estimateTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        return (int) Math.ceil(text.length() / 4.0);
    }
}
