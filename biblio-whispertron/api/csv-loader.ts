// CSV Loader Script for AstraDB
// This script loads books from a CSV file into AstraDB with multiple embeddings

import { AstraDB, Collection } from '@datastax/astra-db-ts';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Book interface
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

/**
 * Class to handle loading books from CSV to AstraDB
 */
class LibraryCatalogLoader {
  private db: AstraDB;
  private collection!: Collection;
  private booksProcessed: number = 0;
  private totalBooks: number = 0;
  
  /**
   * Constructor
   */
  constructor(token: string, endpoint: string) {
    this.db = new AstraDB(token, endpoint);
  }
  
  /**
   * Initialize the catalog collection
   */
  async initialize(collectionName: string = 'books_catalog'): Promise<void> {
    try {
      // Try to get existing collection or create a new one
      try {
        this.collection = await this.db.collection(collectionName);
        console.log(`Connected to existing ${collectionName} collection`);
      } catch (error) {
        console.log(`Creating new ${collectionName} collection`);
        this.collection = await this.db.createCollection(collectionName, {
          vector: {
            dimensions: 1024, // Standard dimension for most embedding models
            metric: 'cosine'
          }
        });
      }
    } catch (error) {
      console.error('Error initializing catalog:', error);
      throw new Error('Failed to initialize the catalog');
    }
  }
  
  /**
   * Load books from a CSV file
   */
  async loadBooksFromCSV(filePath: string, batchSize: number = 10): Promise<string[]> {
    try {
      console.log(`Loading books from ${filePath}...`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filePath} does not exist`);
      }
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });
      
      // Convert records to Book objects
      const books: Book[] = records.map((record: any) => ({
        title: record.title,
        author: record.author,
        year: parseInt(record.year),
        description: record.description || '',
        genre: record.genre || '',
        publisher: record.publisher || ''
      })).filter((book: Book) => 
        // Filter out books with missing required fields
        book.title && book.author && !isNaN(book.year) && book.description
      );
      
      this.totalBooks = books.length;
      console.log(`Found ${this.totalBooks} valid books in CSV`);
      
      // Add all books and track their IDs
      const bookIds: string[] = [];
      
      // Process books in batches
      for (let i = 0; i < books.length; i += batchSize) {
        const batch = books.slice(i, i + batchSize);
        const batchPromises = batch.map(book => this.addBook(book));
        const batchIds = await Promise.all(batchPromises);
        bookIds.push(...batchIds);
        
        // Update progress
        this.booksProcessed += batch.length;
        this.logProgress();
      }
      
      console.log(`\nCompleted loading ${this.booksProcessed} books into AstraDB`);
      return bookIds;
    } catch (error) {
      console.error('Error loading books from CSV:', error);
      throw error;
    }
  }
  
  /**
   * Add a single book with multiple embeddings
   */
  async addBook(book: Book): Promise<string> {
    try {
      const { _id, ...bookWithoutId } = book;

      // Insert the original book record
      const response = await this.collection.insertOne({
        ...bookWithoutId,
        embedding_type: 'original',
      });
      
      const bookId = response.insertedId as string;
      
      // Generate embeddings for the book
      await this.generateEmbeddingsForBook(book, bookId);
      
      return bookId;
    } catch (error) {
      console.error(`Error adding book "${book.title}":`, error);
      throw error;
    }
  }
  
  /**
   * Generate multiple embeddings for a book
   */
  private async generateEmbeddingsForBook(book: Book, bookId: string): Promise<void> {
    try {
      const { _id, ...bookWithoutId } = book;

      // Create title+author embedding entry
      await this.collection.insertOne({
        ...bookWithoutId,
        source_id: bookId,
        embedding_type: 'title_author',
        $vectorize: `${book.title} ${book.author}`,
      });
      
      // Create description embedding entry
      await this.collection.insertOne({
        ...bookWithoutId,
        source_id: bookId,
        embedding_type: 'description',
        $vectorize: book.description,
      });
      
      // Create combined embedding entry
      await this.collection.insertOne({
        ...bookWithoutId,
        source_id: bookId,
        embedding_type: 'combined',
        $vectorize: `${book.title} ${book.author} ${book.description} ${book.genre || ''}`,
      });
    } catch (error) {
      console.error(`Error generating embeddings for book "${book.title}":`, error);
      throw error;
    }
  }
  
  /**
   * Log progress to console
   */
  private logProgress(): void {
    const percent = ((this.booksProcessed / this.totalBooks) * 100).toFixed(1);
    process.stdout.write(`\rProcessed ${this.booksProcessed}/${this.totalBooks} books (${percent}%)`);
  }
}

/**
 * Main function to run the script
 */
async function main() {
  const ASTRA_DB_TOKEN = process.env.ASTRA_DB_TOKEN;
  const ASTRA_DB_ENDPOINT = process.env.ASTRA_DB_ENDPOINT;
  const CSV_FILE_PATH = process.env.CSV_FILE_PATH || process.argv[2];
  const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10');
  
  // Validate required parameters
  if (!ASTRA_DB_TOKEN) {
    console.error('Missing ASTRA_DB_TOKEN. Set it in .env file or as an environment variable');
    process.exit(1);
  }
  
  if (!ASTRA_DB_ENDPOINT) {
    console.error('Missing ASTRA_DB_ENDPOINT. Set it in .env file or as an environment variable');
    process.exit(1);
  }
  
  if (!CSV_FILE_PATH) {
    console.error('Missing CSV_FILE_PATH. Provide it as an argument or set it in .env file');
    console.error('Usage: ts-node csv-loader.ts <path_to_csv_file>');
    process.exit(1);
  }
  
  try {
    console.log('Starting CSV import to AstraDB...');
    
    // Initialize loader
    const loader = new LibraryCatalogLoader(ASTRA_DB_TOKEN, ASTRA_DB_ENDPOINT);
    await loader.initialize();
    
    // Load books from CSV
    const bookIds = await loader.loadBooksFromCSV(CSV_FILE_PATH, BATCH_SIZE);
    
    console.log(`Successfully added ${bookIds.length} books to AstraDB`);
    process.exit(0);
  } catch (error) {
    console.error('Error running the loader script:', error);
    process.exit(1);
  }
}

// Run the script if executed directly
if (require.main === module) {
  main().catch(console.error);
}

// Export for use in other modules
export { LibraryCatalogLoader };