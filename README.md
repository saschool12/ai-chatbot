# NovaAI Chatbot 🤖

A modern full-stack AI Chatbot application built with **Spring Boot 3** (Java 17) and vanilla HTML5/CSS3/JavaScript.

## Features

- **Multi-Persona AI Engine**: Switch between distinct personalities:
  - *Nova (General Assistant)*: Helpful, friendly, and balanced.
  - *Tech Specialist*: Deep-dive code reviews, architecture tips, and technical troubleshooting.
  - *Creative Companion*: Brainstorming, storytelling, and imaginative problem-solving.
- **Built-in NLP & Sentiment Analysis**: Keyword extraction, sentiment scoring, and rule-based conversational intelligence without external dependencies.
- **External LLM Integration**: Pluggable architecture ready for OpenAI, Gemini, Claude, or Ollama.
- **Session Management**: In-memory multi-session conversation tracking with history inspection and session reset.
- **RESTful API**: Clean JSON endpoints for chat, personas, sessions, and system metrics.
- **Responsive Web Interface**: Sleek dark/light theme chat interface with real-time stats and persona selector.
- **Container Ready**: Includes `Dockerfile` and `docker-compose.yml`.

---

## Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.5, Gradle
- **Frontend**: HTML5, Modern CSS3, JavaScript (Fetch API)
- **Containerization**: Docker, Docker Compose

---

## Getting Started

### Prerequisites

- Java 17+
- Gradle 8+ (or use the included `./gradlew`)

### Build & Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/saschool12/ai-chatbot.git
   cd ai-chatbot
   ```

2. Run tests:
   ```bash
   ./gradlew test
   ```

3. Start the application:
   ```bash
   ./gradlew bootRun
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```

### Run with Docker

```bash
docker compose up --build
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a chat message and receive AI response |
| `GET` | `/api/personas` | List all available AI personas |
| `GET` | `/api/sessions` | List all active chat sessions |
| `GET` | `/api/sessions/{id}` | Get session details and message history |
| `POST` | `/api/sessions` | Create a new chat session |
| `DELETE` | `/api/sessions/{id}` | Delete a specific session |
| `POST` | `/api/clear` | Clear all active sessions |
| `GET` | `/api/status` | Application health and memory statistics |

---

## License

MIT
