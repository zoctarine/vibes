# 📚 Biblio Whispertron

> [!NOTE] 
> Part of the [vibes](https://github.com/vibes) playground.
>
> *"Vibes" are quick experiments, mostly built by AI with prompt guidance. Expect rough edges – it's not production-ready, likely buggy, and definitely not example code, but it works..somehow. Think of it as a snapshot from my AI coding playground.*

## ✨ The Idea
What if we had an AI librarian who could recommend books, manage a virtual library catalog, and have intelligent conversations about literature? This project also serves as an exploration of RAG (Retrieval Augmented Generation), vector databases, and embedding technologies to enhance AI interactions with structured data.

## 🔍 The Result
A conversational AI library assistant that can manage a book catalog, provide recommendations, and engage in detailed discussions about books and authors.


## 🛠️ How It Works
Biblio Whispertron uses:
- Gemini API for natural language understanding and generation
- Astra DB for persistent storage of book information
- Express.js for the backend API
- React for the frontend interface

## 🧰 Tech Stack
- Backend: Node.js, Express
- Database: Astra DB
- AI: Google Gemini
- Frontend: React, CSS

## 🤖 AI Tools Used
- ![Claude Desktop and Claude Code](https://img.shields.io/badge/Claude-80%25-blue?style=social)
- ![Cursor](https://img.shields.io/badge/Cursor-20%25-blue?style=social)
- ![Gemini](https://img.shields.io/badge/Gemini-images-blue?style=social)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Astra DB account
- Google Gemini API key

### Installation

1. Set up the environment variables in a `.env` file:
```
PORT=3000
ASTRA_DB_TOKEN=your-astra-db-token
ASTRA_DB_ENDPOINT=your-astra-db-endpoint
GEMINI_API_KEY=your-gemini-api-key
```

2. Install the dependencies:
```bash
# Install API dependencies
cd api
npm install

# Install UI dependencies
cd ../ui
npm install
```

3. Start the development servers:
```bash
# Run the backend API
cd api
npm run dev

# In a new terminal, run the frontend
cd ui
npm start
```

## 🔌 API Documentation

### 1. Create a New Chat Session

Creating a session allows for persistent conversation context.

#### Request

```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json"
```

#### Response

```json
{
  "sessionId": "l8fj2p3k1m5n7q9r",
  "message": "Chat session created successfully"
}
```

### 2. Send a Message in a Session

Use this endpoint for conversational interactions.

#### Request

```bash
curl -X POST http://localhost:3000/api/sessions/l8fj2p3k1m5n7q9r/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Do you have any books about space exploration?"
  }'
```

#### Response

```json
{
  "sessionId": "l8fj2p3k1m5n7q9r",
  "response": "I found several books about space exploration in our catalog. Here are some notable ones:\n\n1. \"The Martian\" by Andy Weir (2011) - Science Fiction\n   An astronaut becomes stranded on Mars and must use his scientific ingenuity to survive until a rescue mission can be mounted.\n\n2. \"Project Hail Mary\" by Andy Weir (2021) - Science Fiction\n   An astronaut wakes up alone on a spacecraft with no memory of who he is or his mission, discovering he must save Earth from an extinction-level threat.\n\n3. \"Sapiens: A Brief History of Humankind\" by Yuval Noah Harari (2011) - Non-Fiction\n   While not exclusively about space exploration, this book includes discussions about humanity's future in space and our cosmic context.\n\nWould you like more specific information about any of these books or would you prefer books on a particular aspect of space exploration?"
}
```

### 3. Stateless Query (No Session)

Use this for one-off queries where conversation context isn't needed.

#### Request

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me more about The Martian by Andy Weir"
  }'
```

#### Response

```json
{
  "query": "Tell me more about The Martian by Andy Weir",
  "response": "\"The Martian\" by Andy Weir is a science fiction novel published in 2011 that became a major bestseller and was later adapted into a successful film directed by Ridley Scott starring Matt Damon.\n\nThe story follows astronaut Mark Watney, who is mistakenly left behind on Mars when his crew evacuates during a dust storm, believing him to be dead. With limited supplies and no immediate way to communicate with Earth, Mark must use his knowledge as a botanist and engineer to survive the harsh Martian environment. He ingeniously grows food, creates water, restores communication with NASA, and works toward his eventual rescue.\n\nThe novel is known for its scientific accuracy, problem-solving narrative, and humor despite the dire circumstances. Andy Weir did extensive research on Mars, space travel, botany, and engineering to make the technical aspects as realistic as possible. The book began as a self-published work before being picked up by a traditional publisher due to its popularity.\n\n\"The Martian\" has been praised for its optimistic view of human ingenuity and cooperation, as the narrative includes not just Mark's survival efforts but also the global collaboration to bring him home safely. It's often cited as one of the most scientifically accurate science fiction novels and has inspired interest in Mars exploration."
}
```

### 4. Get Session Information

Check the status of a specific session.

#### Request

```bash
curl -X GET http://localhost:3000/api/sessions/l8fj2p3k1m5n7q9r
```

#### Response

```json
{
  "sessionId": "l8fj2p3k1m5n7q9r",
  "createdAt": "2025-05-02T14:35:26.712Z",
  "lastActivity": "2025-05-02T14:37:12.421Z"
}
```

### 5. Delete a Session

Clean up when a conversation is complete.

#### Request

```bash
curl -X DELETE http://localhost:3000/api/sessions/l8fj2p3k1m5n7q9r
```

#### Response

```json
{
  "message": "Session deleted successfully"
}
```

## 📝 Managing the Library Catalog

### Adding Books via API

#### Request

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Project Hail Mary",
    "author": "Andy Weir",
    "year": 2021,
    "description": "An astronaut wakes up alone on a spacecraft with no memory of who he is or his mission, discovering he must save Earth from an extinction-level threat.",
    "genre": "Science Fiction",
    "publisher": "Ballantine Books"
  }'
```

#### Response

```json
{
  "bookId": "l8fj2p3k1m5n7q9r",
  "message": "Book added successfully"
}
```

### Adding Books Through Chat

You can naturally add a book by describing it in a chat session:

```bash
curl -X POST http://localhost:3000/api/sessions/l8fj2p3k1m5n7q9r/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add the book Dune by Frank Herbert published in 1965. It is a science fiction novel set on the desert planet Arrakis and follows the story of Paul Atreides as his family takes control of the planet."
  }'
```

## 🧩 Features

- Conversational book recommendations
- Book catalog management
- Author and genre information
- Reading history tracking
- Natural language queries
- Persistent chat sessions

## 🔮 Future Improvements

- Integration with public book APIs
- User accounts and personalized recommendations
- Book rating and review system
- Reading progress tracking
- E-book integration

## 📄 License

[MIT License](LICENSE)