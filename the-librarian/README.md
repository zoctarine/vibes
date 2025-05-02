# Library Catalog API Usage Examples

## Setting Up

First, make sure to set up the environment variables in a `.env` file:

```
PORT=3000
ASTRA_DB_TOKEN=your-astra-db-token
ASTRA_DB_ENDPOINT=your-astra-db-endpoint
GEMINI_API_KEY=your-gemini-api-key
```

Then install the dependencies and start the server:

```bash
npm install
npm start
```

## API Endpoints

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

## Usage in a Web Application

Here's a simple example of how you might use the API in a frontend JavaScript application:

```javascript
// Create a new session
async function createSession() {
  const response = await fetch('http://localhost:3000/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.sessionId;
}

// Send a message in a session
async function sendMessage(sessionId, message) {
  const response = await fetch(`http://localhost:3000/api/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  return data.response;
}

// Usage example
async function chatExample() {
  // Create a session
  const sessionId = await createSession();
  console.log(`Session created: ${sessionId}`);
  
  // Send a series of messages
  const responses = [];
  
  responses.push(await sendMessage(
    sessionId, 
    "Can you recommend some science fiction books about space?"
  ));
  
  responses.push(await sendMessage(
    sessionId, 
    "Tell me more about The Martian"
  ));
  
  responses.push(await sendMessage(
    sessionId, 
    "Who is the author and what else did they write?"
  ));
  
  // Display the conversation
  responses.forEach((response, i) => {
    console.log(`Response ${i+1}: ${response}`);
  });
}

chatExample();
```

# Adding Books to the Library Catalog

This document shows examples of how to add books to your library catalog through the API and via chat interface.

## 1. Add a Book Directly via API

You can add a book by providing the book data directly in JSON format:

### Request

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

### Response

```json
{
  "bookId": "l8fj2p3k1m5n7q9r",
  "message": "Book added successfully"
}
```

## 2. Add a Book Through Chat Session

You can naturally add a book by describing it in a chat session:

### Example 1: Direct Session Message

#### Request

```bash
curl -X POST http://localhost:3000/api/sessions/l8fj2p3k1m5n7q9r/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add the book Dune by Frank Herbert published in 1965. It is a science fiction novel set on the desert planet Arrakis and follows the story of Paul Atreides as his family takes control of the planet."
  }'
```

#### Response

```json
{
  "sessionId": "l8fj2p3k1m5n7q9r",
  "response": "I've added \"Dune\" by Frank Herbert (1965) to the library catalog. The book has been assigned ID: k7j9h5g3f1d. Is there anything else you'd like to know about this book or would you like to add another one?"
}
```

### Example 2: Using Dedicated Add-Book Endpoint

This endpoint is specifically designed for adding books from natural language descriptions:

#### Request

```bash
curl -X POST http://localhost:3000/api/sessions/l8fj2p3k1m5n7q9r/add-book \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Please add The Hitchhiker's Guide to the Galaxy by Douglas Adams published in 1979. It's a comedic science fiction series that follows the adventures of Arthur Dent after Earth is destroyed to make way for a hyperspace bypass."
  }'
```

#### Response

```json
{
  "bookId": "p5o3i7u1y9t",
  "book": {
    "title": "The Hitchhiker's Guide to the Galaxy",
    "author": "Douglas Adams",
    "year": 1979,
    "description": "A comedic science fiction series that follows the adventures of Arthur Dent after Earth is destroyed to make way for a hyperspace bypass.",
    "genre": "Science Fiction",
    "publisher": null
  },
  "response": "I've added the book \"The Hitchhiker's Guide to the Galaxy\" by Douglas Adams. It's now in the catalog and can be found in searches. This classic comedic science fiction novel from 1979 follows Arthur Dent's adventures after Earth is destroyed. Would you like to add another book or perhaps search for something in our catalog?"
}
```

## 3. Add a Book with Stateless Query

For simple integrations without the need for session context:

### Request

```bash
curl -X POST http://localhost:3000/api/add-book-from-text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Add 1984 by George Orwell, published in 1949. This dystopian novel presents a society under surveillance and control by a totalitarian regime."
  }'
```

### Response

```json
{
  "bookId": "j3k5l7n9b1v",
  "book": {
    "title": "1984",
    "author": "George Orwell",
    "year": 1949,
    "description": "This dystopian novel presents a society under surveillance and control by a totalitarian regime.",
    "genre": "Dystopian Fiction"
  },
  "message": "Book added successfully"
}
```

## Natural Language Book Addition Examples

The system can extract book information from various forms of natural language descriptions:

1. **Formal structured description:**
   "Add the book 'War and Peace' by Leo Tolstoy, published in 1869. It's a historical novel that chronicles the French invasion of Russia and the impact of the Napoleonic era on Russian society."

2. **Casual conversational style:**
   "Hey, can you add Harry Potter and the Philosopher's Stone to the library? It's by J.K. Rowling from 1997, about a young wizard who discovers he has magical powers and goes to a school for wizards."

3. **Multiple books in one message:**
   The system will add the first book it can extract complete information for and provide guidance on adding the others separately.

4. **Incomplete information:**
   If essential information is missing (title, author, year, or description), the system will prompt for the missing details.

## Best Practices for Adding Books

For the best results when adding books through chat:

1. Always include:
   - Full title
   - Complete author name
   - Publication year
   - Brief description (1-2 sentences)

2. If possible, also include:
   - Genre
   - Publisher

3. Use clear language like "add", "create", or "insert" followed by "book" or "title" to help the system recognize your intent.

4. After adding a book, you can immediately search for it or add more books to the catalog.