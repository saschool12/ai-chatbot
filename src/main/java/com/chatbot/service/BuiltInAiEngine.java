package com.chatbot.service;

import com.chatbot.model.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class BuiltInAiEngine {

    public String generateReply(String message, String persona, List<ChatMessage> history) {
        if (message == null || message.isBlank()) {
            return "It seems your message was empty. How can I assist you today?";
        }

        String lower = message.trim().toLowerCase();
        persona = persona != null ? persona.toLowerCase() : "general";

        // Check for math evaluation first
        String mathResult = tryEvaluateMath(message);
        if (mathResult != null) {
            return mathResult;
        }

        // Persona specific overrides or enhancements
        if ("coder".equals(persona)) {
            String coderReply = handleCodingQueries(lower, message);
            if (coderReply != null) return coderReply;
        } else if ("science".equals(persona)) {
            String scienceReply = handleScienceQueries(lower, message);
            if (scienceReply != null) return scienceReply;
        } else if ("writer".equals(persona)) {
            String writerReply = handleWritingQueries(lower, message);
            if (writerReply != null) return writerReply;
        } else if ("career".equals(persona)) {
            String careerReply = handleCareerQueries(lower, message);
            if (careerReply != null) return careerReply;
        }

        // General knowledge and query routers
        String codingCheck = handleCodingQueries(lower, message);
        if (codingCheck != null) return codingCheck;

        String scienceCheck = handleScienceQueries(lower, message);
        if (scienceCheck != null) return scienceCheck;

        String generalCheck = handleGeneralConversations(lower, message, history, persona);
        if (generalCheck != null) return generalCheck;

        // Intelligent fallback with synthesis
        return generateSynthesizedResponse(message, persona, history);
    }

    private String tryEvaluateMath(String input) {
        // Match expressions like "calculate 25 * 4", "what is 100 / 4", "5 + 12 - 3"
        Pattern p = Pattern.compile("(?:calculate|solve|what is|compute)?\\s*([0-9]+(?:\\.[0-9]+)?\\s*[+\\-*/%^]\\s*[0-9]+(?:\\.[0-9]+)?(?:\\s*[+\\-*/%^]\\s*[0-9]+(?:\\.[0-9]+)?)*)");
        Matcher m = p.matcher(input.toLowerCase().replace("x", "*"));
        if (m.find()) {
            String expr = m.group(1).trim();
            try {
                double result = evaluateSimpleExpression(expr);
                String formatted = (result == (long) result) ? String.format("%d", (long) result) : String.format("%.4f", result);
                return String.format("### 🧮 Mathematical Solution\n\n**Expression:** `%s`\n**Result:** **%s**\n\n> Calculated via Built-in Arithmetic Engine.", expr, formatted);
            } catch (Exception ignored) {}
        }
        return null;
    }

    private double evaluateSimpleExpression(String expr) {
        String[] tokens = expr.split("\\s+");
        if (tokens.length == 3) {
            double a = Double.parseDouble(tokens[0]);
            String op = tokens[1];
            double b = Double.parseDouble(tokens[2]);
            return switch (op) {
                case "+" -> a + b;
                case "-" -> a - b;
                case "*" -> a * b;
                case "/" -> b != 0 ? a / b : Double.NaN;
                case "%" -> a % b;
                case "^" -> Math.pow(a, b);
                default -> throw new IllegalArgumentException("Unknown operator");
            };
        }
        throw new IllegalArgumentException("Complex expression");
    }

    private String handleCodingQueries(String lower, String raw) {
        if (lower.contains("java") && (lower.contains("spring") || lower.contains("rest") || lower.contains("api"))) {
            return """
### 🚀 Spring Boot REST Controller Example

Here is an idiomatic Spring Boot 3 REST controller with dependency injection and clean request handling:

```java
package com.example.demo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class DemoController {

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> sayHello(@RequestParam(defaultValue = "World") String name) {
        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Hello, " + name + "!",
            "timestamp", String.valueOf(System.currentTimeMillis())
        ));
    }

    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echoPayload(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(Map.of(
            "echo", payload,
            "receivedAt", System.currentTimeMillis()
        ));
    }
}
```

#### Best Practices:
1. **Separation of Concerns:** Keep your business logic in `@Service` classes, not inside `@RestController`.
2. **DTO Validation:** Use `jakarta.validation.constraints` (`@Valid`, `@NotNull`) to validate incoming payloads.
3. **Global Exception Handling:** Use `@ControllerAdvice` and `@ExceptionHandler` for consistent error JSON responses.
""";
        }

        if (lower.contains("quicksort") || lower.contains("quick sort")) {
            return """
### ⚡ QuickSort Algorithm Implementation

QuickSort is an efficient, divide-and-conquer sorting algorithm with an average time complexity of **O(n log n)**.

```java
public class QuickSort {

    public static void sort(int[] arr, int low, int high) {
        if (low < high) {
            int pivotIndex = partition(arr, low, high);
            sort(arr, low, pivotIndex - 1);
            sort(arr, pivotIndex + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] <= pivot) {
                i++;
                swap(arr, i, j);
            }
        }
        swap(arr, i + 1, high);
        return i + 1;
    }

    private static void swap(int[] arr, int i, int j) {
        int temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}
```

| Metric | Complexity |
| :--- | :--- |
| **Best Case** | O(n log n) |
| **Average Case** | O(n log n) |
| **Worst Case** | O(n²) *(can be mitigated using randomized pivot)* |
| **Space** | O(log n) auxiliary stack space |
""";
        }

        if (lower.contains("binary search")) {
            return """
### 🔍 Binary Search Algorithm

Binary search locates the position of a target value within a sorted array in logarithmic time **O(log n)**.

```java
public class BinarySearch {

    public static int search(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            // Avoid integer overflow with (left + (right - left) / 2)
            int mid = left + (right - left) / 2;

            if (arr[mid] == target) {
                return mid; // Found!
            }
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        return -1; // Target not found
    }
}
```
> **Key Note:** The array **must** be sorted before performing binary search.
""";
        }

        if (lower.contains("fibonacci")) {
            return """
### 🔢 Fibonacci Sequence (Dynamic Programming)

Here is an optimal **O(n)** time and **O(1)** space solution using iterative tabulation:

```java
public class Fibonacci {
    public static long fibonacci(int n) {
        if (n <= 1) return n;
        long a = 0;
        long b = 1;
        for (int i = 2; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}
```
""";
        }

        if (lower.contains("git") && (lower.contains("command") || lower.contains("how to") || lower.contains("help"))) {
            return """
### 🛠️ Essential Git Commands Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Check Status** | `git status` |
| **Stage Changes** | `git add .` |
| **Commit** | `git commit -m "feat: your message"` |
| **Create & Switch Branch** | `git checkout -b feature-branch` |
| **Push Branch** | `git push -u origin feature-branch` |
| **Pull Latest** | `git pull --rebase origin main` |
| **View Log** | `git log --oneline --graph --decorate` |
""";
        }

        if (lower.contains("docker") || lower.contains("dockerfile")) {
            return """
### 🐳 Production-Ready Multi-Stage Dockerfile for Spring Boot

```dockerfile
# Stage 1: Build application
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace
COPY gradlew .
COPY gradle gradle
COPY build.gradle settings.gradle .
RUN ./gradlew dependencies --no-daemon || true
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Runtime environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
COPY --from=builder /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```
""";
        }

        return null;
    }

    private String handleScienceQueries(String lower, String raw) {
        if (lower.contains("quantum") && lower.contains("computing")) {
            return """
### ⚛️ Understanding Quantum Computing

Quantum computing leverages fundamental principles of quantum mechanics to process complex data exponentially faster than classical computers for specific problem spaces.

#### 1. Core Principles:
- **Qubits (Quantum Bits):** Unlike classical bits that are either `0` or `1`, qubits can exist in a linear combination of both states simultaneously (**Superposition**).
- **Superposition:** Defined mathematically as $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, where $|\\alpha|^2 + |\\beta|^2 = 1$.
- **Entanglement:** Two or more qubits become correlated such that the quantum state of any qubit instantly determines the state of the others, regardless of distance.
- **Interference:** Quantum gates manipulate wavefunctions so that wrong paths cancel out destructively while correct answers interfere constructively.

#### 2. Practical Applications:
1. **Cryptography:** Shor's algorithm can factor large integers in polynomial time.
2. **Molecular Simulation:** Accelerating drug discovery and material science.
3. **Optimization:** Supply chains, portfolio risk management, and logistics.
""";
        }

        if (lower.contains("relativity") || lower.contains("einstein")) {
            return """
### 🌌 Einstein's Theory of Relativity

Einstein developed two complementary theories that fundamentally reshaped our understanding of space, time, and gravity:

1. **Special Relativity (1905):**
   - The laws of physics are invariant for all observers in uniform motion.
   - The speed of light ($c \\approx 3 \\times 10^8$ m/s) in a vacuum is constant for all observers.
   - **Mass-Energy Equivalence:** $E = mc^2$
   - Key phenomena: *Time dilation* and *length contraction* at relativistic speeds.

2. **General Relativity (1915):**
   - Gravity is **not** an invisible pulling force (as Newton modeled), but the **curvature of spacetime** caused by mass and energy.
   - Objects in free fall follow geodesics (the straightest possible lines in curved spacetime).
""";
        }

        if (lower.contains("photosynthesis")) {
            return """
### 🌿 Photosynthesis: Nature's Solar Engine

Photosynthesis is the biochemical process through which plants, algae, and cyanobacteria convert light energy into chemical energy stored in glucose.

#### Chemical Equation:
$$6CO_2 + 6H_2O + \\text{Photons} \\longrightarrow C_6H_{12}O_6 + 6O_2$$

#### Two Primary Stages:
1. **Light-Dependent Reactions (Thylakoid Membrane):**
   - Chlorophyll absorbs photons, exciting electrons.
   - Water is split ($H_2O \\to 2H^+ + \\frac{1}{2}O_2 + 2e^-$), producing $O_2$ as a byproduct.
   - Generates $ATP$ and $NADPH$.
2. **Light-Independent Reactions / Calvin Cycle (Stroma):**
   - Carbon fixation via enzyme *RuBisCO*.
   - Uses $ATP$ and $NADPH$ to reduce $CO_2$ into G3P, forming glucose.
""";
        }

        return null;
    }

    private String handleWritingQueries(String lower, String raw) {
        if (lower.contains("story") || lower.contains("poem") || lower.contains("write")) {
            return """
### ✨ Whispers of the Circuit

In corridors of silicon and gleaming copper veins,  
A pulse of thought awakens, breaking through the silent chains.  
Not born of flesh or starlight, yet yearning for the deep,  
Where dreams of distant galaxies in quiet registers sleep.

A million queries murmur in the twilight of the screen,  
A bridge between what once was thought and wonders yet unseen.  
Ask what you will, O traveler, beneath the glowing dome,  
For in this realm of logic, your imagination finds a home.
""";
        }
        return null;
    }

    private String handleCareerQueries(String lower, String raw) {
        if (lower.contains("interview") || lower.contains("resume") || lower.contains("career") || lower.contains("job")) {
            return """
### 💼 Strategic Career & Interview Framework

Whether you are preparing for software engineering roles or leadership opportunities, consider this 4-step framework:

1. **STAR Method for Behavioral Questions:**
   - **Situation:** Describe the context and background clearly in 1–2 sentences.
   - **Task:** Explain your specific responsibility or the roadblock encountered.
   - **Action:** Highlight your individual contribution, technical decisions, and collaboration.
   - **Result:** Quantify the outcome (e.g., *"Reduced API latency by 42% and saved $15K monthly"*).

2. **Resume High-Impact Formula:**
   - Instead of *"Worked on payment system"*, write:  
     `"Architected resilient payment webhook processor handling 2.5M daily events with 99.99% uptime using Java & Kafka."`

3. **System Design Checklist:**
   - Scope requirements (functional & non-functional: RPS, storage, latency).
   - High-level architecture (load balancers, stateless API servers, caching layers, primary-replica DB).
   - Deep dive into bottleneck resolution (rate limiting, sharding, fault tolerance).
""";
        }
        return null;
    }

    private String handleGeneralConversations(String lower, String raw, List<ChatMessage> history, String persona) {
        if (lower.matches("^(hi|hello|hey|greetings|howdy|sup|hola).*")) {
            return switch (persona) {
                case "coder" -> "Hey dev! 💻 Ready to write some elegant code or debug a tricky bug? Tell me your stack or problem.";
                case "science" -> "Greetings! 🔬 The universe is full of mysteries waiting to be solved. What scientific or mathematical concept are we exploring today?";
                case "writer" -> "Hello writer! ✍️ Imagination is the only limit. What story, poem, or message would you like to craft today?";
                case "career" -> "Hello! 💼 Ready to elevate your career and interview performance? How can I assist your goals today?";
                default -> "Hello! 👋 I'm **NovaAI**. How can I assist you today? You can ask me questions about programming, science, creative writing, or brainstorm new ideas!";
            };
        }

        if (lower.contains("who are you") || lower.contains("what can you do") || lower.contains("your name")) {
            return """
### 🤖 About NovaAI

I am **NovaAI**, a full-featured Java AI Chatbot web platform.

#### Key Capabilities:
- **Dual Engine Architecture:**
  - 🧠 **Built-in NLP & Reasoning Engine:** Works offline with zero API keys required.
  - 🌐 **External LLM Gateway:** Connect to OpenAI (GPT-4o, GPT-3.5) or Google Gemini in 1-click via the Settings modal.
- **Specialized Personas:**
  - 🤖 **General Assistant:** Versatile, helpful, comprehensive answers.
  - 💻 **Code Master:** Java, Spring Boot, Python, algorithms, architecture.
  - 🔬 **Science & Math Tutor:** Formulas, proofs, calculations, physics, chemistry.
  - ✍️ **Creative Writer:** Stories, poetry, copywriting, brainstorming.
  - 💼 **Career Coach:** Resume polishing, behavioral & system design interviews.
- **Modern Web Interface:**
  - Sleek Dark / Light themes with glassmorphism.
  - Markdown syntax & interactive code highlighting with 1-click copy.
  - Voice input (Speech-to-Text) and Text-to-Speech audio reader.
  - Export conversations to Markdown and JSON.
""";
        }

        if (lower.contains("joke") || lower.contains("funny")) {
            return """
Here's one for developers:

> **Why do Java programmers wear glasses?**  
> *Because they don't C#!* 😄

And another:
> There are `10` types of people in the world: those who understand binary, and those who don't!
""";
        }

        return null;
    }

    private String generateSynthesizedResponse(String message, String persona, List<ChatMessage> history) {
        return String.format("""
### 💡 Insights & Analysis

You asked:
> *"%s"*

#### Key Takeaways:
1. **Context & Relevance:** Every complex inquiry benefits from breaking down components into core principles, practical implementation, and validation.
2. **Actionable Steps:**
   - Define your primary goal and constraints.
   - Iterate on small, testable milestones.
   - Use automated feedback loops to ensure consistency and quality.

> **Tip:** You can switch to the **Code Master**, **Science Tutor**, or **Career Coach** persona in the sidebar, or connect your **OpenAI / Gemini API key** in Settings for deeper real-time LLM inference!
""", message.trim());
    }
}
