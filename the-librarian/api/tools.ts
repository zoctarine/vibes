// Generic Gemini Response Interpreter
// This class can handle any type of query about a library catalog and generate appropriate responses

import { AstraDB, Collection } from '@datastax/astra-db-ts';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GeminiQueryAnalyzer } from './interpreter';

// Types
interface Book {
  _id?: string;
  title: string;
  author: string;
  year: number;
  description: string;
  genre?: string;
  publisher?: string;
  embedding_type?: string;
  source_id?: string;
}

interface SearchResult {
  books: Book[];
  query: string;
}

/**
 * Class that uses Gemini to interpret any type of user query about books
 */
class GenericGeminiInterpreter {
  private genAI: any;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Initialize the model for result interpretation
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });
  }

  /**
   * Process any type of user query and retrieve appropriate search results
   */
  async processQuery(
    query: string,
    searchResults: SearchResult | null,
    previousContext: string = ""
  ): Promise<string> {
    // Determine what type of query this is and formulate the appropriate prompt
    const prompt = this.createPrompt(query, searchResults, previousContext);

    try {
      // Get response from Gemini
      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return response;
    } catch (error) {
      console.error("Error processing query with Gemini:", error);
      return `I'm sorry, I encountered an error while processing your question: "${query}". Please try again with a different question.`;
    }
  }

  /**
   * Create a dynamic prompt based on the type of query and available context
   */
  private createPrompt(
    query: string,
    searchResults: SearchResult | null,
    previousContext: string
  ): string {
    // Convert book data to a more readable format for Gemini, if available
    let booksSection = "";
    if (searchResults && searchResults.books && searchResults.books.length > 0) {
      booksSection = "SEARCH RESULTS:\n" +
        searchResults.books.map((book, index) => {
          return `Book ${index + 1}:
Title: ${book.title}
Author: ${book.author}
Year: ${book.year}
Genre: ${book.genre || "Unknown"}
Description: ${book.description}
`;
        }).join("\n");
    }

    // Add previous conversation context if available
    let contextSection = "";
    if (previousContext) {
      contextSection = "PREVIOUS CONVERSATION:\n" + previousContext + "\n\n";
    }

    // Base system instructions that work for any query type
    const baseInstructions = `
You are an expert librarian assistant for a digital library catalog.

Your role is to help users find books and answer questions about the catalog.
Always maintain a helpful, knowledgeable, and conversational tone.
Be concise but thorough in your responses.

USER QUERY:
"${query}"

${contextSection}
${booksSection}
`;

    // Determine the type of query and add specialized instructions
    if (this.isBookDetailQuery(query)) {
      return baseInstructions + `
Focus on providing detailed information about the specific book the user is asking about.
If the book is in the search results, provide comprehensive details about it.
If the book is not in the search results, politely inform the user and suggest similar books if possible.
`;
    } else if (this.isRecommendationQuery(query)) {
      return baseInstructions + `
Provide personalized book recommendations based on the user's query and available search results.
For each recommendation, briefly explain why you're suggesting it.
Consider genre, themes, writing style, and popularity when making recommendations.
`;
    } else if (this.isComparisonQuery(query)) {
      return baseInstructions + `
Compare the books mentioned in the query or search results.
Focus on similarities and differences in themes, style, critical reception, and influence.
Be balanced in your assessment, highlighting strengths of each book.
`;
    } else if (this.isAuthorQuery(query)) {
      return baseInstructions + `
Provide information about the author(s) mentioned in the query.
If multiple books by the author are in the results, briefly overview their work.
Focus on their writing style, major works, and influence.
`;
    } else if (searchResults && searchResults.books.length > 0) {
      // Generic search result interpretation
      return baseInstructions + `
Analyze these search results in relation to the user's query.
Highlight the most relevant books that match what the user is looking for.
Be conversational and helpful in your response.
`;
    } else {
      // No search results or general query
      return baseInstructions + `
Respond to the user's query as helpfully as possible.
If they're asking for a book search but no results are provided, suggest they try different search terms.
If they're asking a general question about books or the library, answer based on your knowledge.
Keep your response conversational and natural.
`;
    }
  }

  /**
   * Determine if the query is asking for details about a specific book
   */
  private isBookDetailQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      lowerQuery.includes("tell me more about") ||
      lowerQuery.includes("more details on") ||
      lowerQuery.includes("more information about") ||
      lowerQuery.includes("what is") && lowerQuery.includes("about") ||
      lowerQuery.includes("summary of") ||
      lowerQuery.includes("synopsis of") ||
      lowerQuery.includes("plot of") ||
      (lowerQuery.includes("the book") &&
        (lowerQuery.includes("tell me about") || lowerQuery.includes("what is")))
    );
  }

  /**
   * Determine if the query is asking for book recommendations
   */
  private isRecommendationQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      lowerQuery.includes("recommend") ||
      lowerQuery.includes("suggestion") ||
      lowerQuery.includes("similar to") ||
      lowerQuery.includes("like") && (lowerQuery.includes("book") || lowerQuery.includes("read")) ||
      lowerQuery.includes("what should i read") ||
      lowerQuery.includes("good books")
    );
  }

  /**
   * Determine if the query is comparing books
   */
  private isComparisonQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      lowerQuery.includes("compare") ||
      lowerQuery.includes("difference between") ||
      lowerQuery.includes("similarities between") ||
      lowerQuery.includes("better") ||
      lowerQuery.includes("versus") || lowerQuery.includes(" vs ") ||
      lowerQuery.includes("which one")
    );
  }

  /**
   * Determine if the query is about an author
   */
  private isAuthorQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      lowerQuery.includes("who is") && (lowerQuery.includes("author") || lowerQuery.includes("writer")) ||
      lowerQuery.includes("about the author") ||
      lowerQuery.includes("author of") ||
      lowerQuery.includes("written by") ||
      lowerQuery.includes("books by")
    );
  }
}

/**
 * Enhanced LibraryCatalog class that uses the generic interpreter
 */
class EnhancedLibraryCatalog {
  private db: AstraDB;
  private collection!: Collection;
  private interpreter: GenericGeminiInterpreter;
  private queryAnalyzer: GeminiQueryAnalyzer;
  private conversationHistory: string = "";

  constructor(
    astraToken: string,
    astraEndpoint: string,
    geminiApiKey: string
  ) {
    this.db = new AstraDB(astraToken, astraEndpoint);
    this.interpreter = new GenericGeminiInterpreter(geminiApiKey);
    this.queryAnalyzer = new GeminiQueryAnalyzer(geminiApiKey);
  }

  // Initialize the catalog collection
  async initialize(): Promise<void> {
    try {
      // Try to get existing collection or create a new one
      try {
        this.collection = await this.db.collection('books_catalog');
        console.log('Connected to existing books_catalog collection');
      } catch (error) {
        console.log('Creating new books_catalog collection');
        this.collection = await this.db.createCollection('books_catalog', {
          vector: {
            dimensions: 1536, // Adjust based on your embedding model
            metric: 'cosine'
          }
        });
      }
    } catch (error) {
      console.error('Error initializing catalog:', error);
      throw new Error('Failed to initialize the catalog');
    }
  }

  // Process a user query, regardless of what it's asking
  async processUserQuery(query: string): Promise<string> {
    console.log(`Processing user query: ${query}`);

    try {
      // Check if the query is about adding a book
      if (this.isAddBookQuery(query)) {
        // Try to extract book information
        const bookData = await this.extractBookDataFromText(query);

        if (bookData) {
          // Add the book
          const bookId = await this.addBook(bookData);

          // Return a confirmation message
          return `I've added "${bookData.title}" by ${bookData.author} (${bookData.year}) to the library catalog. The book has been assigned ID: ${bookId}. Is there anything else you'd like to know about this book or would you like to add another one?`;
        } else {
          // Could not extract book data
          return `I couldn't extract complete book information from your message. To add a book, please include the title, author, publication year, and a brief description. For example: "Add the book 'Dune' by Frank Herbert, published in 1965. It's a science fiction novel about a desert planet with valuable resources."`;
        }
      }

      // Then, try a generic search for the query
      let searchResults: SearchResult | null = null;

      // If it's not a meta-question about the conversation, search for books
      if (!this.isMetaConversationalQuery(query)) {
        searchResults = await this.searchBooks(query);
      }

      // Use Gemini to interpret the query and generate a response
      const response = await this.interpreter.processQuery(
        query,
        searchResults,
        this.conversationHistory
      );

      // Update conversation history
      this.updateConversationHistory(query, response);

      return response;
    } catch (error) {
      console.error('Error processing query:', error);
      return `I'm sorry, I encountered an error while processing your question. Please try again with a different question.`;
    }
  }

 
/**
 * Search books using the appropriate embedding type
 */
async searchBooks(query: string): Promise<SearchResult> {
  try {
    // Use Gemini to analyze the query
    const analysis = await this.queryAnalyzer.analyzeQuery(query);
    console.log('Query analysis:', JSON.stringify(analysis, null, 2));
    
    // Add embedding type to the filters
    const filters = {
      ...analysis.filters,
      embedding_type: analysis.embedding_type
    };
    
    // Perform vector search with filters
    const results = await this.collection.find(
      filters,
      {
        sort: { $vectorize: analysis.search_terms } as any,
        limit: 5 // Adjust based on needs
      }
    ).toArray();
    
    return {
      books: results,
      query: analysis.original_query
    };
  } catch (error) {
    console.error('Error searching books:', error);
    throw error;
  }
}

  // Check if the query is about the conversation itself rather than the books
  private isMetaConversationalQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      lowerQuery.includes("what did i just ask") ||
      lowerQuery.includes("what were we talking about") ||
      lowerQuery.includes("can you summarize our conversation") ||
      lowerQuery.includes("what have we discussed") ||
      lowerQuery.includes("repeat what you just said")
    );
  }

  // Update the conversation history
  private updateConversationHistory(query: string, response: string): void {
    // Add the latest exchange to the history
    this.conversationHistory += `User: ${query}\nAssistant: ${response}\n\n`;

    // Limit history length to avoid context overflow
    const maxHistoryLength = 2000; // Adjust based on token limits
    if (this.conversationHistory.length > maxHistoryLength) {
      // Keep only the most recent exchanges
      const exchanges = this.conversationHistory.split('\n\n');
      this.conversationHistory = exchanges.slice(-5).join('\n\n') + '\n\n';
    }
  }


  /**
   * Add a book to the catalog
   */
  async addBook(book: Book): Promise<string> {
    try {
      // Insert the book into the collection
      const response = await this.collection.insertOne({
        ...book,
        embedding_type: 'original',
      });

      const bookId = response.insertedId as string;

      // Generate embeddings for the book
      await this.generateEmbeddingsForBook(book, bookId);

      console.log(`Added book "${book.title}" with ID ${bookId}`);
      return bookId;
    } catch (error) {
      console.error('Error adding book:', error);
      throw error;
    }
  }

  /**
   * Generate embeddings for a book
   */
  private async generateEmbeddingsForBook(book: Book, bookId: string): Promise<void> {
    try {
      // Create title+author embedding entry
      await this.collection.insertOne({
        ...book,
        _id: undefined, // Let AstraDB generate a new ID
        source_id: bookId,
        embedding_type: 'title_author',
        $vectorize: `${book.title} ${book.author}`,
      });

      // Create description embedding entry
      await this.collection.insertOne({
        ...book,
        _id: undefined, // Let AstraDB generate a new ID
        source_id: bookId,
        embedding_type: 'description',
        $vectorize: book.description,
      });

      // Create combined embedding entry
      await this.collection.insertOne({
        ...book,
        _id: undefined, // Let AstraDB generate a new ID
        source_id: bookId,
        embedding_type: 'combined',
        $vectorize: `${book.title} ${book.author} ${book.description} ${book.genre || ''}`,
      });
    } catch (error) {
      console.error('Error generating embeddings for book:', error);
      throw error;
    }
  }

  /**
   * Extract book data from natural language input
   */
  async extractBookDataFromText(text: string): Promise<Book | null> {
    try {
      // Use Gemini to extract book information
      const prompt = `
    You are a librarian assistant tasked with extracting book information from user input.
    
    Extract the following information from the text below:
    - title: The title of the book
    - author: The author of the book
    - year: The publication year (as a number)
    - description: A description or summary of the book
    - genre: The genre of the book (if mentioned)
    - publisher: The publisher of the book (if mentioned)
    
    Respond ONLY with a valid JSON object containing these fields.
    If any required field (title, author, year, description) is missing, respond with null for that field.
    If the input doesn't appear to be about adding a book, respond with an empty JSON object {}.
    
    User input: "${text}"
    `;

    const responseText = await this.interpreter.processQuery(prompt, null, "");

      // Extract the JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const bookData = JSON.parse(jsonMatch[0]) as Book;

      // Check if we have the required fields
      if (!bookData.title || !bookData.author || !bookData.year || !bookData.description) {
        return null;
      }

      return bookData;
    } catch (error) {
      console.error('Error extracting book data:', error);
      return null;
    }
  }

  // Helper method to detect add book queries
  private isAddBookQuery(query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return (
      (lowerQuery.includes("add") || lowerQuery.includes("create") || lowerQuery.includes("insert")) &&
      (lowerQuery.includes("book") || lowerQuery.includes("novel") || lowerQuery.includes("title")) &&
      (lowerQuery.includes("by") || lowerQuery.includes("author"))
    );
  }
}

// Example usage
async function main() {
  // Load environment variables
  const ASTRA_DB_TOKEN = process.env.ASTRA_DB_TOKEN || '';
  const ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT || '';
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

  if (!ASTRA_DB_TOKEN || !ASTRA_DB_ENDPOINT || !GEMINI_API_KEY) {
    console.error('Please set the ASTRA_DB_TOKEN, ASTRA_DB_ENDPOINT, and GEMINI_API_KEY environment variables');
    process.exit(1);
  }

  // Initialize the catalog
  const catalog = new EnhancedLibraryCatalog(
    ASTRA_DB_TOKEN,
    ASTRA_DB_ENDPOINT,
    GEMINI_API_KEY
  );
  await catalog.initialize();

  // Example queries to demonstrate different types
  const queries = [
    "Do you have any books about space exploration?",
    "Tell me more about 'The Martian' by Andy Weir",
    "Can you recommend some fantasy books with strong female characters?",
    "How does Dune compare to Foundation?",
    "What other books did Frank Herbert write besides Dune?"
  ];

  // Process each query
  for (const query of queries) {
    console.log(`\nUser: ${query}`);
    const response = await catalog.processUserQuery(query);
    console.log(`System: ${response}`);
  }
}

// Export the classes
export { GenericGeminiInterpreter, EnhancedLibraryCatalog };