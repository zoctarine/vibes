// Library Catalog Chat API
// This file implements a REST API for the library catalog chat functionality

import express from 'express';
import { Request, Response } from 'express';

import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { EnhancedLibraryCatalog } from './tools';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Initialize the library catalog
const ASTRA_DB_TOKEN = process.env.ASTRA_DB_TOKEN || '';
const ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!ASTRA_DB_TOKEN || !ASTRA_DB_ENDPOINT || !GEMINI_API_KEY) {
  console.error('Please set the ASTRA_DB_TOKEN, ASTRA_DB_ENDPOINT, and GEMINI_API_KEY environment variables');
  process.exit(1);
}

// Store active chat sessions
interface ChatSession {
  id: string;
  catalog: EnhancedLibraryCatalog;
  createdAt: Date;
  lastActivity: Date;
}

const chatSessions = new Map<string, ChatSession>();

// Initialize a global catalog instance for stateless requests
let globalCatalog: EnhancedLibraryCatalog | null = null;

// Initialize the global catalog
async function initGlobalCatalog() {
  globalCatalog = new EnhancedLibraryCatalog(
    ASTRA_DB_TOKEN,
    ASTRA_DB_ENDPOINT,
    GEMINI_API_KEY
  );
  await globalCatalog.initialize();
  console.log('Global catalog initialized');
}

// Session cleanup job (runs every hour)
setInterval(() => {
  const now = new Date();
  const sessionTimeout = 3600000; // 1 hour in milliseconds
  
  for (const [sessionId, session] of chatSessions.entries()) {
    const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
    if (timeSinceLastActivity > sessionTimeout) {
      chatSessions.delete(sessionId);
      console.log(`Session ${sessionId} expired and removed`);
    }
  }
}, 3600000);

// API Routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Library Catalog Chat API is running' });
});

// Create a new chat session
app.post('/api/sessions', async (req, res) => {
  try {
    const sessionId = generateSessionId();
    
    const catalog = new EnhancedLibraryCatalog(
      ASTRA_DB_TOKEN,
      ASTRA_DB_ENDPOINT,
      GEMINI_API_KEY
    );
    await catalog.initialize();
    
    const session: ChatSession = {
      id: sessionId,
      catalog,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    chatSessions.set(sessionId, session);
    
    res.status(201).json({
      sessionId,
      message: 'Chat session created successfully'
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Get session info
app.get('/api/sessions/:sessionId', (req: Request, res: Response): any => {
  const { sessionId } = req.params;
  const session = chatSessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.status(200).json({
    sessionId: session.id,
    createdAt: session.createdAt,
    lastActivity: session.lastActivity
  });
});

// Delete a session
app.delete('/api/sessions/:sessionId', (req: Request, res: Response): any => {
  const { sessionId } = req.params;
  
  if (!chatSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  chatSessions.delete(sessionId);
  res.status(200).json({ message: 'Session deleted successfully' });
});

// Send a message in a session
app.post('/api/sessions/:sessionId/messages', async (req: Request, res: Response): Promise<any> => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Update last activity
    session.lastActivity = new Date();
    
    // Process the message
    const response = await session.catalog.processUserQuery(message);
    
    res.status(200).json({
      sessionId,
      response
    });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Stateless query endpoint (no session required)
app.post('/api/query', async (req: Request, res: Response): Promise<any> => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    // Initialize global catalog if needed
    if (!globalCatalog) {
      await initGlobalCatalog();
    }
    
    // Process the query
    const response = await globalCatalog!.processUserQuery(query);
    
    res.status(200).json({
      query,
      response
    });
  } catch (error) {
    console.error('Error processing stateless query:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

app.post('/api/books', async (req: Request, res: Response): Promise<any> => {
  try {
    const bookData = req.body;
    
    // Validate required fields
    if (!bookData.title || !bookData.author || !bookData.year || !bookData.description) {
      return res.status(400).json({ 
        error: 'Missing required fields. Title, author, year, and description are required.' 
      });
    }
    
    // Add the book
    const bookId = await globalCatalog!.addBook(bookData);
    
    res.status(201).json({
      bookId,
      message: 'Book added successfully'
    });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Add a book through chat in a session
app.post('/api/sessions/:sessionId/add-book', async (req: Request, res: Response): Promise<any> => {
  try {
    const { sessionId } = req.params;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text description of the book is required' });
    }
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Update last activity
    session.lastActivity = new Date();
    
    // Extract book data from the text
    const bookData = await session.catalog.extractBookDataFromText(text);
    
    if (!bookData) {
      return res.status(400).json({ 
        error: 'Could not extract valid book information. Please provide title, author, year, and description.' 
      });
    }
    
    // Add the book
    const bookId = await session.catalog.addBook(bookData);
    
    // Generate a response
    const response = await session.catalog.processUserQuery(
      `I've added the book "${bookData.title}" by ${bookData.author}. Can you confirm it's been added?`
    );
    
    res.status(201).json({
      bookId,
      book: bookData,
      response
    });
  } catch (error) {
    console.error('Error adding book through chat:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Add a book through the stateless query endpoint
app.post('/api/add-book-from-text', async (req: Request, res: Response): Promise<any> => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text description of the book is required' });
    }
    
    // Initialize global catalog if needed
    if (!globalCatalog) {
      await initGlobalCatalog();
    }
    
    // Extract book data from the text
    const bookData = await globalCatalog!.extractBookDataFromText(text);
    
    if (!bookData) {
      return res.status(400).json({ 
        error: 'Could not extract valid book information. Please provide title, author, year, and description.' 
      });
    }
    
    // Add the book
    const bookId = await globalCatalog!.addBook(bookData);
    
    res.status(201).json({
      bookId,
      book: bookData,
      message: 'Book added successfully'
    });
  } catch (error) {
    console.error('Error adding book from text:', error);
    res.status(500).json({ error: 'Failed to add book' });
  }
});

// Start the server
app.listen(port, async () => {
  // Initialize the global catalog
  await initGlobalCatalog();
  console.log(`Library Catalog Chat API is running on port ${port}`);
});

// Helper function to generate a unique session ID
function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
}

// Export for testing
export { app };