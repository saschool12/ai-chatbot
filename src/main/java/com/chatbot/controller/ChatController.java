package com.chatbot.controller;

import com.chatbot.model.ChatMessage;
import com.chatbot.model.ChatRequest;
import com.chatbot.model.ChatResponse;
import com.chatbot.model.ChatSession;
import com.chatbot.model.Persona;
import com.chatbot.service.AiService;
import com.chatbot.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.management.ManagementFactory;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ChatController {

    private final AiService aiService;
    private final SessionService sessionService;
    private final long appStartTime = System.currentTimeMillis();

    public ChatController(AiService aiService, SessionService sessionService) {
        this.aiService = aiService;
        this.sessionService = sessionService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        if (request.getMessage() == null || request.getMessage().isBlank()) {
            return ResponseEntity.badRequest().body(new ChatResponse("Message cannot be empty.", request.getSessionId(), request.getPersona(), "system", "none", 0, 0));
        }
        ChatResponse response = aiService.processChat(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/personas")
    public ResponseEntity<List<Persona>> getPersonas() {
        return ResponseEntity.ok(aiService.getPersonas());
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ChatSession> getSession(@PathVariable String id) {
        return sessionService.getSession(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/sessions")
    public ResponseEntity<ChatSession> createSession(@RequestParam(defaultValue = "general") String persona) {
        ChatSession session = sessionService.getOrCreateSession(null, persona);
        return ResponseEntity.ok(session);
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Map<String, Boolean>> deleteSession(@PathVariable String id) {
        boolean deleted = sessionService.deleteSession(id);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clearAll() {
        sessionService.clearAll();
        return ResponseEntity.ok(Map.of("status", "cleared"));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Runtime runtime = Runtime.getRuntime();
        long totalMem = runtime.totalMemory() / (1024 * 1024);
        long freeMem = runtime.freeMemory() / (1024 * 1024);
        long usedMem = totalMem - freeMem;
        long uptimeSeconds = (System.currentTimeMillis() - appStartTime) / 1000;

        return ResponseEntity.ok(Map.of(
                "application", "NovaAI Chatbot",
                "version", "1.0.0",
                "javaVersion", System.getProperty("java.version"),
                "uptimeSeconds", uptimeSeconds,
                "usedMemoryMb", usedMem,
                "totalMemoryMb", totalMem,
                "activeSessions", sessionService.getAllSessions().size(),
                "availablePersonas", aiService.getPersonas().size()
        ));
    }
}
