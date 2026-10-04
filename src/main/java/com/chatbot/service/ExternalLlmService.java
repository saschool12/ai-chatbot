package com.chatbot.service;

import com.chatbot.model.ChatMessage;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExternalLlmService {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public ExternalLlmService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    public String callOpenAiCompatible(String apiKey, String model, String systemPrompt, List<ChatMessage> history, String userMessage, Double temperature) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("API Key is missing for external provider.");
        }
        if (model == null || model.isBlank()) {
            model = "gpt-4o-mini";
        }

        List<Map<String, String>> messages = new ArrayList<>();
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            messages.add(Map.of("role", "system", "content", systemPrompt));
        }

        // Include recent history (up to last 8 messages for context)
        int start = Math.max(0, history.size() - 8);
        for (int i = start; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> payload = new HashMap<>();
        payload.put("model", model);
        payload.put("messages", messages);
        payload.put("temperature", temperature != null ? temperature : 0.7);

        String jsonPayload = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(60))
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            JsonNode errorRoot = null;
            try {
                errorRoot = objectMapper.readTree(response.body());
            } catch (Exception ignored) {}

            String errMsg = (errorRoot != null && errorRoot.has("error") && errorRoot.get("error").has("message"))
                    ? errorRoot.get("error").get("message").asText()
                    : "HTTP " + response.statusCode() + ": " + response.body();
            throw new RuntimeException("API error: " + errMsg);
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode choices = root.get("choices");
        if (choices != null && choices.isArray() && choices.size() > 0) {
            JsonNode firstChoice = choices.get(0);
            if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                return firstChoice.get("message").get("content").asText();
            }
        }
        return "No response received from model.";
    }

    public String callGemini(String apiKey, String model, String systemPrompt, List<ChatMessage> history, String userMessage) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("Gemini API key is required.");
        }
        if (model == null || model.isBlank()) {
            model = "gemini-3.5-flash";
        }

        // Build contents array
        List<Map<String, Object>> contents = new ArrayList<>();
        int start = Math.max(0, history.size() - 8);
        for (int i = start; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            String role = "user".equalsIgnoreCase(msg.getRole()) ? "user" : "model";
            contents.add(Map.of(
                    "role", role,
                    "parts", List.of(Map.of("text", msg.getContent()))
            ));
        }
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", userMessage))
        ));

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", contents);
        if (systemPrompt != null && !systemPrompt.isBlank()) {
            payload.put("system_instruction", Map.of(
                    "parts", List.of(Map.of("text", systemPrompt + "\nTone: Intelligent, natural, insightful, formatting with clean markdown."))
            ));
        }

        String jsonPayload = objectMapper.writeValueAsString(payload);
        String[] candidateModels = new String[]{model, "gemini-flash-lite-latest", "gemini-3.1-flash-lite"};
        HttpResponse<String> response = null;

        for (String m : candidateModels) {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", m, apiKey);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            try {
                response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 200) {
                    break;
                }
            } catch (Exception ignored) {}
        }

        if (response == null || response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error (Status " + (response != null ? response.statusCode() : "timeout") + ")");
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode candidates = root.get("candidates");
        if (candidates != null && candidates.isArray() && candidates.size() > 0) {
            JsonNode candidate = candidates.get(0);
            JsonNode content = candidate.get("content");
            if (content != null && content.has("parts")) {
                JsonNode parts = content.get("parts");
                if (parts.isArray() && parts.size() > 0) {
                    return parts.get(0).get("text").asText();
                }
            }
        }
        return "No response received from Gemini.";
    }

    public String callSmartLlm(String systemPrompt, List<ChatMessage> history, String userMessage) {
        try {
            List<Map<String, String>> messages = new ArrayList<>();
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                messages.add(Map.of(
                        "role", "system",
                        "content", systemPrompt + "\n\nFormatting: Use clean, professional, readable markdown with proper code syntax highlighting. Always answer the user's question directly, insightfully, and thoroughly."
                ));
            }

            int start = Math.max(0, history != null ? history.size() - 6 : 0);
            if (history != null) {
                for (int i = start; i < history.size(); i++) {
                    ChatMessage msg = history.get(i);
                    messages.add(Map.of("role", msg.getRole(), "content", msg.getContent()));
                }
            }
            messages.add(Map.of("role", "user", "content", userMessage));

            Map<String, Object> payload = new HashMap<>();
            payload.put("model", "openai");
            payload.put("messages", messages);
            payload.put("temperature", 0.7);

            String jsonPayload = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://text.pollinations.ai/openai"))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode choices = root.get("choices");
                if (choices != null && choices.isArray() && choices.size() > 0) {
                    JsonNode choice = choices.get(0);
                    if (choice.has("message") && choice.get("message").has("content")) {
                        String content = choice.get("message").get("content").asText();
                        if (content != null && !content.isBlank()) {
                            return content;
                        }
                    }
                }
            }
        } catch (Exception ignored) {
            // Gracefully fall back to local rule engine
        }
        return null;
    }
}
