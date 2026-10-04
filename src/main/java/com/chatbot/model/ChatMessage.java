package com.chatbot.model;

import java.time.Instant;
import java.util.UUID;

public class ChatMessage {
    private String id;
    private String role; // "user", "assistant", "system"
    private String content;
    private String timestamp;
    private int tokens;
    private long latencyMs;

    public ChatMessage() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = Instant.now().toString();
    }

    public ChatMessage(String role, String content) {
        this();
        this.role = role;
        this.content = content;
    }

    public ChatMessage(String role, String content, int tokens, long latencyMs) {
        this(role, content);
        this.tokens = tokens;
        this.latencyMs = latencyMs;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public int getTokens() {
        return tokens;
    }

    public void setTokens(int tokens) {
        this.tokens = tokens;
    }

    public long getLatencyMs() {
        return latencyMs;
    }

    public void setLatencyMs(long latencyMs) {
        this.latencyMs = latencyMs;
    }
}
