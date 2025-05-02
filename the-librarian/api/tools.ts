// Generic Gemini Response Interpreter
// This class can handle any type of query about a library catalog and generate appropriate responses

import { AstraDB, Collection } from '@datastax/astra-db-ts';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { GeminiQueryAnalyzer } from './interpreter';

// Types
interface Book {
  title: string;
  author: string;
  year: number;
  description: string;
  similarity?: number;
  genre?: string;
  publisher?: string;
}

interface SearchResults {
  books: Book[];
  query: string;
}

/**
 * Class that uses Gemini to interpret any type of user query about books
 */
class GenericGeminiInterpreter {
  private model: GenerativeModel;
  private catalog: EnhancedLibraryCatalog;

  constructor(apiKey: string, catalog: EnhancedLibraryCatalog) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
       model: "gemini-2.0-flash" 
      });
    this.catalog = catalog;
  }

  /**
   * Process any type of user query and retrieve appropriate search results
   */
  async processQuery(
    query: string,
    conversationHistory: string[] = [],
    userWantsSuggestions: boolean = false
  ): Promise<{ response: string; debug: { prompt: string; geminiResponse: string; searchResults: string; conversationHistory: string; userWantsSuggestions: boolean } }> {
    try {
      // Search for relevant books
      const searchResults = await this.searchBooks(query);
      const searchResultsText = searchResults.books.length > 0
        ? searchResults.books.map((book: Book) => `${book.title} by ${book.author} (${book.year})`).join('\n')
        : 'No relevant books found.';

      // Construct the prompt
      const prompt = `You are a helpful library assistant. Use the following information to answer the user's query:

${searchResultsText}

${conversationHistory.length > 0 ? `Previous conversation:\n${conversationHistory.join('\n')}\n` : ''}

User's query: ${query}

${userWantsSuggestions ? 'You should suggest relevant books from the search results.' : 'Do not suggest books unless specifically asked.'}

You should also not suggest books that are not relevant to the user's query.

Please provide a helpful response that directly addresses the user's query.`;

      // Get response from Gemini
      const result = await this.model.generateContent({
        contents: [{
          parts: [{ text: prompt }],
          role: 'user'
        }],
        generationConfig: {
          temperature: 0.0,
        }
      });
      const response = result.response.text();

      return {
        response,
        debug: {
          prompt,
          geminiResponse: response,
          searchResults: searchResultsText,
          conversationHistory: conversationHistory.join('\n'),
          userWantsSuggestions
        }
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw error;
    }
  }

  private async handleGeminiError(query: string, error: unknown): Promise<string> {
    try {
      // Create a specific error handling prompt
      const errorPrompt = `
You are an expert librarian assistant. The user asked: "${query}"

I encountered an error while processing this query. Please provide a helpful response that:
1. Acknowledges the user's question
2. Explains that we're having some technical difficulties
3. Suggests alternative ways to help the user
4. Maintains a helpful and professional tone

Error details: ${error instanceof Error ? error.message : 'Unknown error'}
`;

      const result = await this.model.generateContent(errorPrompt);
      return result.response.text();
    } catch (fallbackError) {
      // If even the error handling fails, return a basic message
      return `I apologize, but I'm having trouble processing your question right now. Could you please try rephrasing your question or ask something else?`;
    }
  }

  /**
   * Create a dynamic prompt based on the type of query and available context
   */
  private createPrompt(
    query: string,
    searchResults: SearchResults | null,
    previousContext: string,
    userWantsSuggestions: boolean
  ): string {
    // Convert book data to a more readable format for Gemini, if available
    let booksSection = "";
    if (searchResults && searchResults.books && searchResults.books.length > 0) {
      booksSection = 
        "IMOPRTANT: the following search results are the most relevant search results based on the user query. " + 
        "They are not all the books in the library. " +
        "You should use these results to help the user find the book they are looking for. " +
        "You should not make up your own results or suggest books that are not in the search results. " +
        "You should also not suggest books that are not relevant to the user's query. " +
        "You should also not suggest books that are not in the search results. " +
        "You should also not suggest books that are not relevant to the user's query.\n\n " +
        "SEARCH RESULTS:\n" +
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

    // Add user preference about suggestions
    const suggestionInstruction = userWantsSuggestions
      ? ""
      : "IMPORTANT: The user has requested NOT to receive book suggestions unless they explicitly ask for them. Do NOT provide recommendations or suggestions unless the user specifically asks for them.";

    // Base system instructions that work for any query type
    const baseInstructions = `
You are an expert librarian assistant for a digital library catalog.

Your role is to help users find books and answer questions about the catalog.
Always maintain a helpful, knowledgeable, and conversational tone.
Be concise but thorough in your responses.

${suggestionInstruction}

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
    } else if (this.isRecommendationQuery(query) && userWantsSuggestions) {
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
If the user is asking for recommendations or for a book search, then:
- Analyze these search results in relation to the user's query.
- Highlight the most relevant books that match what the user is looking for.
- Be conversational and helpful in your response.

Otherwise, keep your response to the user's query as helpful as possible.
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

  private async searchBooks(query: string): Promise<SearchResults> {
    return this.catalog.searchBooks(query);
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
  private userWantsSuggestions: boolean = false;

  constructor(
    astraToken: string,
    astraEndpoint: string,
    geminiApiKey: string
  ) {
    this.db = new AstraDB(astraToken, astraEndpoint);
    this.interpreter = new GenericGeminiInterpreter(geminiApiKey, this);
    this.queryAnalyzer = new GeminiQueryAnalyzer(geminiApiKey);
  }

  async initialize(): Promise<void> {
    try {
      this.collection = await this.db.collection('books_catalog');
    } catch (error) {
      console.error('Error initializing collection:', error);
      throw error;
    }
  }

  async searchBooks(query: string): Promise<SearchResults> {
    try {
      // Use Gemini to analyze the query
      const analysis = await this.queryAnalyzer.analyzeQuery(query);
      
      // Search based on the analysis
      const results = await this.collection.find(
        analysis.filters,
        {
          sort: { $vectorize: analysis.search_terms } as any,
          limit: 5
        }
      ).toArray();
      
      return {
        books: results as Book[],
        query: analysis.original_query
      };
    } catch (error) {
      console.error('Error searching books:', error);
      return {
        books: [],
        query: query
      };
    }
  }

  async processUserQuery(query: string): Promise<{ response: string; debug: { prompt: string; geminiResponse: string; searchResults: string; conversationHistory: string; userWantsSuggestions: boolean } }> {
    try {
      // Process the query
      const response = await this.interpreter.processQuery(
        query,
        this.conversationHistory.split('\n'),
        this.userWantsSuggestions
      );

      // Update conversation history
      this.conversationHistory += `\nUser: ${query}\nAssistant: ${response.response}`;

      return response;
    } catch (error) {
      console.error('Error processing user query:', error);
      throw error;
    }
  }

  async addBook(book: Book): Promise<string> {
    try {
      // Insert the book into the collection
      const response = await this.collection.insertOne({
        ...book,
        embedding_type: 'original',
      });

      const bookId = response.insertedId as string;

      try {
        // Generate embeddings for the book
        await this.generateEmbeddingsForBook(book, bookId);
        console.log(`Added book "${book.title}" with ID ${bookId}`);
        return bookId;
      } catch (embeddingError) {
        console.error('Error generating embeddings:', embeddingError);
        // Still return the book ID even if embedding generation fails
        return bookId;
      }
    } catch (error) {
      console.error('Error adding book:', error);
      throw new Error(`Failed to add book: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateEmbeddingsForBook(book: Book, bookId: string): Promise<void> {
    const embeddingTypes = [
      {
        type: 'title_author',
        text: `${book.title} ${book.author}`
      },
      {
        type: 'description',
        text: book.description
      },
      {
        type: 'combined',
        text: `${book.title} ${book.author} ${book.description} ${book.genre || ''}`
      }
    ];

    for (const embedding of embeddingTypes) {
      try {
        await this.collection.insertOne({
          ...book,
          _id: undefined,
          source_id: bookId,
          embedding_type: embedding.type,
          $vectorize: embedding.text,
        });
      } catch (error) {
        console.error(`Error creating ${embedding.type} embedding:`, error);
        // Continue with other embeddings even if one fails
        continue;
      }
    }
  }

  async extractBookDataFromText(text: string): Promise<Book | null> {
    try {
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

      const result = await this.interpreter.processQuery(prompt, [], true);
      const responseText = result.response;

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
    console.log(`System: ${response.response}`);
  }
}

// Export the classes
export { GenericGeminiInterpreter, EnhancedLibraryCatalog };