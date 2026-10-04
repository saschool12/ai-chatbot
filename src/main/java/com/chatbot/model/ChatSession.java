package com.chatbot.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ChatSession {
    private String id;
    private String title;
    private String persona;
    private String createdAt;
    private String updatedAt;
    private List<ChatMessage> messages = new ArrayList<>();

    public ChatSession() {
        this.id = UUID.randomUUID().toString();
        this.title = "New Conversation";
        this.persona = "general";
        this.createdAt = Instant.now().toString();
        this.updatedAt = Instant.now().toString();
    }

    public ChatSession(String id, String title, String persona) {
        this();
        if (id != null && !id.isBlank()) {
            this.id = id;
        }
        if (title != null && !title.isBlank()) {
            this.title = title;
        }
        if (persona != null && !persona.isBlank()) {
            this.persona = persona;
        }
    }

    public void addMessage(ChatMessage message) {
        this.messages.add(message);
        this.updatedAt = Instant.now().toString();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPersona() {
        return persona;
    }

    public void setPersona(String persona) {
        this.persona = persona;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages;
    }
}
