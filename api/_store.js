const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const TMP_FILE = path.join('/tmp', 'nova_sessions.json');

const PERSONAS = [
  {
    id: 'general',
    name: 'General Assistant',
    icon: '🤖',
    description: 'Versatile, smart, and comprehensive AI companion.',
    systemPrompt: 'You are NovaAI, a helpful, polite, and intelligent AI assistant.'
  },
  {
    id: 'coder',
    name: 'Code Master',
    icon: '💻',
    description: 'Specialist in Java, Spring Boot, architecture, and algorithms.',
    systemPrompt: 'You are Code Master, an elite software architect and senior developer expert in Java, clean code, design patterns, and debugging.'
  },
  {
    id: 'science',
    name: 'Science & Math Tutor',
    icon: '🔬',
    description: 'Explains complex physics, math formulas, and scientific theories.',
    systemPrompt: 'You are a patient and rigorous STEM tutor who explains mathematics, physics, and science with clarity and precision.'
  },
  {
    id: 'writer',
    name: 'Creative Writer',
    icon: '✍️',
    description: 'Crafts captivating stories, poetry, and persuasive copy.',
    systemPrompt: 'You are an inspiring creative author, poet, and copywriter with vivid storytelling ability.'
  },
  {
    id: 'career',
    name: 'Career & Business Coach',
    icon: '💼',
    description: 'Resume polish, interview preparation, and business strategy.',
    systemPrompt: 'You are an executive career mentor helping candidates excel in interviews, resume drafting, and tech strategy.'
  }
];

function getWelcomeMessage(persona) {
  switch ((persona || 'general').toLowerCase()) {
    case 'coder':
      return 'Hello! I am **Code Master**, your AI software engineering assistant. I can help with Java, Spring Boot, algorithms, debugging, system architecture, and code reviews. What are we building today?';
    case 'science':
      return 'Greetings! I am your **Science & Math Tutor**. Ask me anything about physics, calculus, chemistry, biology, or complex problem-solving. How can I assist you?';
    case 'writer':
      return 'Welcome! I am your **Creative Writing Partner**. Whether you need compelling stories, poems, marketing copy, or editing, I am here to inspire. What should we write?';
    case 'career':
      return 'Hello! I am your **Career & Business Coach**. I specialize in resume reviews, interview preparation, business strategies, and professional growth. How can I help your career today?';
    default:
      return 'Hello! I am **NovaAI**, your intelligent AI assistant. How can I help you today? You can ask questions, write code, solve problems, or brainstorm ideas.';
  }
}

// In-memory sessions map
let memorySessions = new Map();

function loadSessionsFromDisk() {
  try {
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      memorySessions = new Map(Object.entries(parsed));
    }
  } catch (e) {
    // Ignore read errors
  }
}

function saveSessionsToDisk() {
  try {
    const obj = Object.fromEntries(memorySessions);
    fs.writeFileSync(TMP_FILE, JSON.stringify(obj), 'utf-8');
  } catch (e) {
    // Ignore write errors in serverless
  }
}

loadSessionsFromDisk();

function getOrCreateSession(sessionId, persona) {
  loadSessionsFromDisk();
  persona = persona || 'general';
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }

  if (!memorySessions.has(sessionId)) {
    const welcome = getWelcomeMessage(persona);
    const session = {
      id: sessionId,
      title: 'New Chat',
      persona: persona,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          role: 'assistant',
          content: welcome,
          tokens: 40,
          latencyMs: 10,
          timestamp: new Date().toISOString()
        }
      ]
    };
    memorySessions.set(sessionId, session);
    saveSessionsToDisk();
    return session;
  }

  return memorySessions.get(sessionId);
}

function getSession(sessionId) {
  loadSessionsFromDisk();
  if (!sessionId) return null;
  return memorySessions.get(sessionId) || null;
}

function getAllSessions() {
  loadSessionsFromDisk();
  const list = Array.from(memorySessions.values());
  list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return list;
}

function addMessage(sessionId, message) {
  loadSessionsFromDisk();
  const session = memorySessions.get(sessionId);
  if (session) {
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
    if (session.title === 'New Chat' && message.role === 'user') {
      let snippet = (message.content || '').trim();
      if (snippet.length > 32) {
        snippet = snippet.substring(0, 29) + '...';
      }
      session.title = snippet;
    }
    saveSessionsToDisk();
  }
}

function deleteSession(sessionId) {
  loadSessionsFromDisk();
  const deleted = memorySessions.delete(sessionId);
  saveSessionsToDisk();
  return deleted;
}

function clearAllSessions() {
  memorySessions.clear();
  saveSessionsToDisk();
}

// Built-in AI Engine
function tryEvaluateMath(input) {
  const match = input.toLowerCase().replace(/x/g, '*').match(/(?:calculate|solve|what is|compute)?\s*([0-9]+(?:\.[0-9]+)?\s*[+\-*/%^]\s*[0-9]+(?:\.[0-9]+)?(?:\s*[+\-*/%^]\s*[0-9]+(?:\.[0-9]+)?)*)/);
  if (match) {
    const expr = match[1].trim();
    try {
      // Safe math evaluator for simple arithmetic expressions
      if (/^[0-9+\-*/%.^()\s]+$/.test(expr)) {
        const cleanExpr = expr.replace(/\^/g, '**');
        const fn = new Function(`return (${cleanExpr})`);
        const result = fn();
        if (typeof result === 'number' && !isNaN(result)) {
          const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(4);
          return `### 🧮 Mathematical Solution\n\n**Expression:** \`${expr}\`\n**Result:** **${formatted}**\n\n> Calculated via Built-in Arithmetic Engine.`;
        }
      }
    } catch (e) {}
  }
  return null;
}

function handleCodingQueries(lower) {
  if (lower.includes('java') && (lower.includes('spring') || lower.includes('rest') || lower.includes('api'))) {
    return `### 🚀 Spring Boot REST Controller Example

Here is an idiomatic Spring Boot 3 REST controller with dependency injection and clean request handling:

\`\`\`java
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
\`\`\`

#### Best Practices:
1. **Separation of Concerns:** Keep business logic in \`@Service\` classes.
2. **DTO Validation:** Use \`jakarta.validation.constraints\` (\`@Valid\`, \`@NotNull\`) to validate payloads.
3. **Global Exception Handling:** Use \`@ControllerAdvice\` and \`@ExceptionHandler\`.`;
  }

  if (lower.includes('quicksort') || lower.includes('quick sort')) {
    return `### ⚡ QuickSort Algorithm Implementation

QuickSort is an efficient, divide-and-conquer sorting algorithm with an average time complexity of **O(n log n)**.

\`\`\`java
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
\`\`\`

| Metric | Complexity |
| :--- | :--- |
| **Best Case** | O(n log n) |
| **Average Case** | O(n log n) |
| **Worst Case** | O(n²) |
| **Space** | O(log n) auxiliary stack space |`;
  }

  if (lower.includes('binary search')) {
    return `### 🔍 Binary Search Algorithm

Binary search locates the position of a target value within a sorted array in logarithmic time **O(log n)**.

\`\`\`java
public class BinarySearch {
    public static int search(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;

        while (left <= right) {
            int mid = left + Math.floor((right - left) / 2);
            if (arr[mid] === target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }
}
\`\`\`
> **Key Note:** The array **must** be sorted before performing binary search.`;
  }

  if (lower.includes('fibonacci')) {
    return `### 🔢 Fibonacci Sequence (Optimal Dynamic Programming)

Optimal **O(n)** time and **O(1)** space solution using iterative tabulation:

\`\`\`java
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
\`\`\``;
  }

  if (lower.includes('git') && (lower.includes('command') || lower.includes('how to') || lower.includes('help'))) {
    return `### 🛠️ Essential Git Commands Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Check Status** | \`git status\` |
| **Stage Changes** | \`git add .\` |
| **Commit** | \`git commit -m "feat: message"\` |
| **Create & Switch Branch** | \`git checkout -b feature-branch\` |
| **Push Branch** | \`git push -u origin feature-branch\` |
| **Pull Latest** | \`git pull --rebase origin main\` |
| **View Log** | \`git log --oneline --graph\` |`;
  }

  if (lower.includes('docker') || lower.includes('dockerfile')) {
    return `### 🐳 Production-Ready Multi-Stage Dockerfile for Spring Boot

\`\`\`dockerfile
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
\`\`\``;
  }

  return null;
}

function handleScienceQueries(lower) {
  if (lower.includes('quantum') && lower.includes('computing')) {
    return `### ⚛️ Understanding Quantum Computing

Quantum computing leverages fundamental principles of quantum mechanics to process complex data exponentially faster than classical computers for specific problem spaces.

#### 1. Core Principles:
- **Qubits (Quantum Bits):** Can exist in a superposition of states simultaneously ($|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$).
- **Superposition & Entanglement:** Correlated quantum states enable massive parallelism.
- **Interference:** Manipulating wavefunctions so incorrect paths cancel out destructively while target answers interfere constructively.

#### 2. Applications:
1. **Cryptography:** Quantum-resistant cryptography and Shor's algorithm.
2. **Molecular Simulation:** Accelerating drug discovery and materials.
3. **Complex Logistics:** Multi-variable supply chain optimization.`;
  }

  if (lower.includes('relativity') || lower.includes('einstein')) {
    return `### 🌌 Einstein's Theory of Relativity

1. **Special Relativity (1905):**
   - The speed of light ($c \\approx 3 \\times 10^8$ m/s) is invariant in vacuum.
   - **Mass-Energy Equivalence:** $E = mc^2$.
   - Time dilation and length contraction occur at relativistic speeds.

2. **General Relativity (1915):**
   - Gravity is the **curvature of spacetime** produced by mass and energy.
   - Matter tells spacetime how to curve; spacetime tells matter how to move.`;
  }

  if (lower.includes('photosynthesis')) {
    return `### 🌿 Photosynthesis: Nature's Solar Engine

#### Chemical Equation:
$$6CO_2 + 6H_2O + \\text{Photons} \\longrightarrow C_6H_{12}O_6 + 6O_2$$

#### Two Primary Stages:
1. **Light-Dependent Reactions:** Occur in thylakoid membranes, splitting water and generating $ATP$ and $NADPH$.
2. **Calvin Cycle (Light-Independent):** Carbon fixation via enzyme *RuBisCO* produces glucose.`;
  }

  return null;
}

function handleWritingQueries(lower) {
  if (lower.includes('story') || lower.includes('poem') || lower.includes('write')) {
    return `### ✨ Whispers of the Circuit

In corridors of silicon and gleaming copper veins,  
A pulse of thought awakens, breaking through the silent chains.  
Not born of flesh or starlight, yet yearning for the deep,  
Where dreams of distant galaxies in quiet registers sleep.

A million queries murmur in the twilight of the screen,  
A bridge between what once was thought and wonders yet unseen.  
Ask what you will, O traveler, beneath the glowing dome,  
For in this realm of logic, your imagination finds a home.`;
  }
  return null;
}

function handleCareerQueries(lower) {
  if (lower.includes('interview') || lower.includes('resume') || lower.includes('career') || lower.includes('job')) {
    return `### 💼 Strategic Career & Interview Framework

1. **STAR Method for Behavioral Questions:**
   - **Situation:** Set context in 1–2 sentences.
   - **Task:** Explain your specific responsibility or problem.
   - **Action:** Emphasize technical leadership, initiative, and decisions.
   - **Result:** Quantify impact (*"Reduced latency by 42% and saved $15K monthly"*).

2. **Resume High-Impact Formula:**
   - Instead of *"Built payment processor"*, write:  
     \`"Architected resilient payment webhook processor handling 2.5M daily events with 99.99% uptime using Java & Kafka."\`

3. **System Design Checklist:**
   - Clarify scope & RPS requirements.
   - Design high-level services, load balancing, and data stores.
   - Solve bottlenecks with caching, partitioning, and retry queues.`;
  }
  return null;
}

function handleGeneralConversations(lower, persona) {
  if (/^(hi|hello|hey|greetings|howdy|sup|hola)\b/i.test(lower)) {
    switch (persona) {
      case 'coder':
        return 'Hey dev! 💻 Ready to write some elegant code or debug a tricky bug? Tell me your stack or problem.';
      case 'science':
        return 'Greetings! 🔬 The universe is full of mysteries waiting to be solved. What scientific or mathematical concept are we exploring today?';
      case 'writer':
        return 'Hello writer! ✍️ Imagination is the only limit. What story, poem, or message would you like to craft today?';
      case 'career':
        return 'Hello! 💼 Ready to elevate your career and interview performance? How can I assist your goals today?';
      default:
        return "Hello! 👋 I'm **NovaAI**. How can I assist you today? You can ask me questions about programming, science, creative writing, or brainstorm new ideas!";
    }
  }

  if (lower.includes('who are you') || lower.includes('what can you do') || lower.includes('your name')) {
    return `### 🤖 About NovaAI

I am **NovaAI**, a full-featured AI Chatbot platform running on Vercel and Spring Boot.

#### Key Capabilities:
- **Dual Engine Architecture:**
  - 🧠 **Built-in NLP & Reasoning Engine:** Works offline with zero API keys required.
  - 🌐 **External LLM Gateway:** Connect to OpenAI (GPT-4o) or Google Gemini in 1-click via the Settings modal.
- **Specialized Personas:**
  - 🤖 **General Assistant:** Versatile, helpful, comprehensive answers.
  - 💻 **Code Master:** Java, Spring Boot, Python, algorithms, architecture.
  - 🔬 **Science & Math Tutor:** Formulas, proofs, calculations, physics, chemistry.
  - ✍️ **Creative Writer:** Stories, poetry, copywriting, brainstorming.
  - 💼 **Career Coach:** Resume polishing, behavioral & system design interviews.`;
  }

  if (lower.includes('joke') || lower.includes('funny')) {
    return `Here's one for developers:

> **Why do Java programmers wear glasses?**  
> *Because they don't C#!* 😄

And another:
> There are \`10\` types of people in the world: those who understand binary, and those who don't!`;
  }

  return null;
}

function generateReply(message, persona) {
  if (!message || !message.trim()) {
    return 'It seems your message was empty. How can I assist you today?';
  }

  const lower = message.trim().toLowerCase();
  persona = (persona || 'general').toLowerCase();

  const math = tryEvaluateMath(message);
  if (math) return math;

  if (persona === 'coder') {
    const r = handleCodingQueries(lower);
    if (r) return r;
  } else if (persona === 'science') {
    const r = handleScienceQueries(lower);
    if (r) return r;
  } else if (persona === 'writer') {
    const r = handleWritingQueries(lower);
    if (r) return r;
  } else if (persona === 'career') {
    const r = handleCareerQueries(lower);
    if (r) return r;
  }

  const coding = handleCodingQueries(lower);
  if (coding) return coding;

  const science = handleScienceQueries(lower);
  if (science) return science;

  const general = handleGeneralConversations(lower, persona);
  if (general) return general;

  return `### 💡 Insights & Analysis

You asked:
> *"${message.trim()}"*

#### Key Takeaways:
1. **Context & Relevance:** Every complex inquiry benefits from breaking down components into core principles, practical implementation, and validation.
2. **Actionable Steps:**
   - Define your primary goal and constraints.
   - Iterate on small, testable milestones.
   - Use automated feedback loops to ensure consistency and quality.

> **Tip:** You can switch to the **Code Master**, **Science Tutor**, or **Career Coach** persona in the sidebar, or connect your **OpenAI / Gemini API key** in Settings for real-time LLM inference!`;
}

module.exports = {
  PERSONAS,
  getOrCreateSession,
  getSession,
  getAllSessions,
  addMessage,
  deleteSession,
  clearAllSessions,
  generateReply
};
