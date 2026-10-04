# NovaAI Chatbot ✦

A modern, ultra-minimal full-stack AI Chatbot application with dual backend support: **Spring Boot 3** (Java 17) and **Node.js / Vercel Serverless**, featuring an aesthetic vanilla HTML5/CSS3/JavaScript interface.

---

## ✨ Features

- **5 Distinct AI Personas**:
  - 🤖 **General Assistant**: Versatile, smart, and comprehensive AI companion.
  - 💻 **Code Master**: Specialist in Java, Spring Boot, architecture, and algorithms.
  - 🔬 **Science & Math Tutor**: Explains physics, calculus formulas, and scientific concepts.
  - ✍️ **Creative Writer**: Storytelling, poetry, and persuasive copy.
  - 💼 **Career & Business Coach**: Resume reviews, STAR interview prep, and business strategy.
- **Dynamic Welcome & Starter Chips**: Interactive starter prompt suggestions customized for each active persona.
- **Multi-Provider AI Engine**:
  - **Google Gemini**: Support for `gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, and `gemini-flash-lite-latest`.
  - **OpenAI Compatible**: Connect OpenAI (GPT-4o, GPT-3.5), Groq, or Ollama.
  - **Nova Smart Engine (Free LLM)**: Fast, free LLM fallback requiring zero API keys.
  - **Built-in Offline Engine**: Built-in mathematical evaluation engine, code synthesizer, and rule-based intelligence.
- **Session Management**: Multi-session conversation history tracking, session switching, and session resets.
- **Chat Export**: Instant export of conversations to formatted **Markdown (.md)** or structured **JSON**.
- **Voice Capabilities**: Built-in Speech-to-Text (voice typing) and Text-to-Speech (audio read-aloud).
- **System Diagnostics**: Real-time modal displaying application health, runtime, active sessions, and memory statistics.
- **Modern Responsive UI**: Ultra-minimal dark/light theme, syntax highlighting for code blocks with one-click copy, and mobile-friendly drawer.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Modern CSS3, JavaScript (Fetch API, Marked.js, Highlight.js, FontAwesome)
- **Java Backend**: Java 17, Spring Boot 3.2.5, Gradle 8.14
- **Node Backend**: Node.js 18+ (zero-dependency native HTTP server + Vercel Serverless functions)
- **Containerization**: Docker, Docker Compose

---

## 🚀 Getting Started

### Prerequisites

- **Option A (Node.js)**: Node.js 18+ installed
- **Option B (Java)**: Java 17+ and Gradle 8+ (or use the included `./gradlew`)

---

### Option 1: Run with Node.js (Quick & Lightweight)

1. Run the test suite:
   ```bash
   npm test
   ```

2. Start the local server:
   ```bash
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

### Option 2: Run with Spring Boot (Java 17)

1. Run the test suite:
   ```bash
   ./gradlew test
   ```

2. Start the application:
   ```bash
   ./gradlew bootRun
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

---

### Option 3: Run with Docker Compose

```bash
docker compose up --build
```

Then visit `http://localhost:8080`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a chat message and receive AI response with token & latency metrics |
| `GET` | `/api/personas` | List all available AI personas |
| `GET` | `/api/sessions` | List all active chat sessions |
| `GET` | `/api/sessions/{id}` | Get session details and full message history |
| `POST` | `/api/sessions` | Create a new chat session for a specific persona |
| `DELETE` | `/api/sessions/{id}` | Delete a specific session |
| `POST` | `/api/clear` | Clear all active sessions |
| `GET` | `/api/status` | Application health, uptime, and memory statistics |

---

## 📄 License

MIT License
