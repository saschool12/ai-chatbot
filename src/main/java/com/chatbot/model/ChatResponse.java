package com.chatbot.model;

import java.time.Instant;
import java.util.UUID;

public class ChatResponse {
    private String id;
    private String reply;
    private String sessionId;
    private String persona;
    private String provider;
    private String model;
    private int tokens;
    private long latencyMs;
    private String timestamp;

    public ChatResponse() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = Instant.now().toString();
    }

    public ChatResponse(String reply, String sessionId, String persona, String provider, String model, int tokens, long latencyMs) {
        this();
        this.reply = reply;
        this.sessionId = sessionId;
        this.persona = persona;
        this.provider = provider;
        this.model = model;
        this.tokens = tokens;
        this.latencyMs = latencyMs;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getPersona() {
        return persona;
    }

    public void setPersona(String persona) {
        this.persona = persona;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
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

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
