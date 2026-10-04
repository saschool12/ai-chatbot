package com.chatbot.service;

import com.chatbot.model.ChatMessage;
import com.chatbot.model.ChatSession;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionService {
    private final Map<String, ChatSession> sessionStore = new ConcurrentHashMap<>();

    public ChatSession getOrCreateSession(String sessionId, String persona) {
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }
        final String finalSessionId = sessionId;
        return sessionStore.computeIfAbsent(finalSessionId, id -> {
            ChatSession session = new ChatSession(id, "New Chat", persona);
            // Add a warm initial greeting from the assistant based on persona
            String welcomeMessage = switch (persona != null ? persona.toLowerCase() : "general") {
                case "coder" -> "Hello! I am **Code Master**, your AI software engineering assistant. I can help with Java, Spring Boot, algorithms, debugging, system architecture, and code reviews. What are we building today?";
                case "science" -> "Greetings! I am your **Science & Math Tutor**. Ask me anything about physics, calculus, chemistry, biology, or complex problem-solving. How can I assist you?";
                case "writer" -> "Welcome! I am your **Creative Writing Partner**. Whether you need compelling stories, poems, marketing copy, or editing, I am here to inspire. What should we write?";
                case "career" -> "Hello! I am your **Career & Business Coach**. I specialize in resume reviews, interview preparation, business strategies, and professional growth. How can I help your career today?";
                default -> "Hello! I am **NovaAI**, your intelligent AI assistant. How can I help you today? You can ask questions, write code, solve problems, or brainstorm ideas.";
            };
            session.addMessage(new ChatMessage("assistant", welcomeMessage, 40, 10));
            return session;
        });
    }

    public Optional<ChatSession> getSession(String sessionId) {
        if (sessionId == null) return Optional.empty();
        return Optional.ofNullable(sessionStore.get(sessionId));
    }

    public List<ChatSession> getAllSessions() {
        List<ChatSession> list = new ArrayList<>(sessionStore.values());
        list.sort((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()));
        return list;
    }

    public void addMessage(String sessionId, ChatMessage message) {
        ChatSession session = sessionStore.get(sessionId);
        if (session != null) {
            session.addMessage(message);
            // Automatically set title from first user message if title is default
            if ("New Chat".equals(session.getTitle()) && "user".equals(message.getRole())) {
                String snippet = message.getContent().strip();
                if (snippet.length() > 32) {
                    snippet = snippet.substring(0, 29) + "...";
                }
                session.setTitle(snippet);
            }
        }
    }

    public boolean deleteSession(String sessionId) {
        return sessionStore.remove(sessionId) != null;
    }

    public void clearAll() {
        sessionStore.clear();
    }
}
