package com.chatbot;

import com.chatbot.model.ChatMessage;
import com.chatbot.model.ChatRequest;
import com.chatbot.model.ChatResponse;
import com.chatbot.model.ChatSession;
import com.chatbot.service.AiService;
import com.chatbot.service.BuiltInAiEngine;
import com.chatbot.service.SessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AiChatbotApplicationTests {

    @Autowired
    private AiService aiService;

    @Autowired
    private BuiltInAiEngine builtInEngine;

    @Autowired
    private SessionService sessionService;

    @Test
    void contextLoads() {
        assertNotNull(aiService);
        assertNotNull(builtInEngine);
        assertNotNull(sessionService);
    }

    @Test
    void testBuiltInAiMathEngine() {
        String reply = builtInEngine.generateReply("calculate 25 * 4", "general", Collections.emptyList());
        assertNotNull(reply);
        assertTrue(reply.contains("100"), "Expected 100 in math calculation output");
    }

    @Test
    void testBuiltInAiCodingPrompt() {
        String reply = builtInEngine.generateReply("show me quicksort in java", "coder", Collections.emptyList());
        assertNotNull(reply);
        assertTrue(reply.contains("QuickSort"), "Expected quicksort code in response");
    }

    @Test
    void testSessionCreationAndPersistence() {
        ChatSession session = sessionService.getOrCreateSession(null, "coder");
        assertNotNull(session.getId());
        assertEquals("coder", session.getPersona());

        ChatMessage userMsg = new ChatMessage("user", "Hello Code Master", 4, 0);
        sessionService.addMessage(session.getId(), userMsg);

        ChatSession retrieved = sessionService.getSession(session.getId()).orElse(null);
        assertNotNull(retrieved);
        assertTrue(retrieved.getMessages().size() >= 2); // Initial greeting + user message
    }

    @Test
    void testAiServiceChatProcessing() {
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello there!");
        request.setPersona("general");

        ChatResponse response = aiService.processChat(request);
        assertNotNull(response);
        assertNotNull(response.getReply());
        assertEquals("builtin", response.getProvider());
        assertTrue(response.getTokens() > 0);
    }
}
