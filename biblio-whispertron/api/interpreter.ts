// Gemini Query Analyzer for Embedding Selection
// This enhances the generic interpreter to determine which embedding type to use

import { GoogleGenerativeAI } from '@google/generative-ai';

// Define embedding types for different search scenarios
export enum EmbeddingType {
  TITLE_AUTHOR = 'title_author',
  DESCRIPTION = 'description',
  COMBINED = 'combined'
}

// Question analysis result interface
export interface QueryAnalysisResult {
  embedding_type: EmbeddingType;
  filters: any;
  search_terms: string;
  original_query: string;
}

/**
 * Class that uses Gemini to determine which embedding type to use for a query
 */
export class GeminiQueryAnalyzer {
  private genAI: any;
  private model: any;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize the model with JSON response configuration
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        response_mime_type: "application/json"
      }
    });
  }
  
  /**
   * Analyze a user query to determine the appropriate embedding type and filters
   */
  async analyzeQuery(query: string): Promise<QueryAnalysisResult> {
    const prompt = `
    You are an AI library assistant that analyzes user questions about books to determine the best search strategy.

    Given this user query: "${query}"

    Please analyze it and determine:
    1. Which type of search would be most appropriate:
       - "title_author" (for queries specifically about book titles or authors)
       - "description" (for queries about book content, themes, or topics)
       - "combined" (for general or recommendation queries)
    2. Any specific filters that should be applied:
       - year (exact year, or before/after a certain year)
       - genre (fiction, non-fiction, mystery, etc.)
       - author name (if looking for books by a specific author)
       - title keywords (if looking for books with specific words in the title)
       - publisher (if looking for books from a specific publisher)
    3. The core search terms to use for semantic search

    Format your response as valid JSON with these fields:
    {
      "embedding_type": "string",
      "filters": {
        // include only the applicable filters
        "year": number or {"$lt": number} or {"$gt": number},
        "genre": "string",
        "author": "string" ,
        "title": "string" ,
        "publisher": "string"
      },
      "search_terms": "string"
    }
    `;

    try {
      const result = await this.model.generateContent({
        contents: [{
          parts: [{ text: prompt }],
          role: 'user'
        }],
        generationConfig: {
          temperature: 0.0,
        }
      });
      const responseText = result.response.text();
      
      // Extract the JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from Gemini response");
      }
      
      // Parse the JSON and add the original query
      const analysisResult = JSON.parse(jsonMatch[0]);
      
      // Convert embedding_type string to enum
      let embeddingType: EmbeddingType;
      if (analysisResult.embedding_type === 'title_author') {
        embeddingType = EmbeddingType.TITLE_AUTHOR;
      } else if (analysisResult.embedding_type === 'description') {
        embeddingType = EmbeddingType.DESCRIPTION;
      } else {
        embeddingType = EmbeddingType.COMBINED;
      }
      
      return {
        embedding_type: embeddingType,
        filters: analysisResult.filters || {},
        search_terms: analysisResult.search_terms || query,
        original_query: query
      };
    } catch (error) {
      console.error("Error analyzing query with Gemini:", error);
      // Provide fallback analysis
      return this.fallbackAnalysis(query);
    }
  }
  
  /**
   * Fallback analysis if Gemini API fails
   */
  private fallbackAnalysis(query: string): QueryAnalysisResult {
    const lowerQuery = query.toLowerCase();
    
    // Basic embedding type detection
    let embeddingType = EmbeddingType.COMBINED;
    if (lowerQuery.includes("who wrote") || lowerQuery.includes("author") || 
        lowerQuery.includes("titled") || lowerQuery.includes("called") ||
        lowerQuery.includes("title")) {
      embeddingType = EmbeddingType.TITLE_AUTHOR;
    } else if (lowerQuery.includes("about") || lowerQuery.includes("theme") || 
               lowerQuery.includes("plot") || lowerQuery.includes("topic") ||
               lowerQuery.includes("content")) {
      embeddingType = EmbeddingType.DESCRIPTION;
    }
    
    // Basic filter extraction
    const filters: any = {};
    
    // Year
    const yearMatch = lowerQuery.match(/(?:from|in|year|published in|before|after) (\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      
      if (lowerQuery.includes("before")) {
        filters.year = { $lt: year };
      } else if (lowerQuery.includes("after")) {
        filters.year = { $gt: year };
      } else {
        filters.year = year;
      }
    }
    
    // Genre
    const genreMatches = [
      "fiction", "non-fiction", "science fiction", "fantasy", "mystery",
      "thriller", "romance", "historical", "biography", "self-help",
      "business", "science", "poetry"
    ];
    
    for (const genre of genreMatches) {
      if (lowerQuery.includes(genre)) {
        filters.genre = { $regex: new RegExp(genre, "i") };
        break;
      }
    }
    
    // Author (basic)
    const authorMatch = lowerQuery.match(/(?:by|author) ([a-z]+ [a-z]+)/i);
    if (authorMatch) {
      filters.author = { $regex: new RegExp(authorMatch[1], "i") };
    }
    
    return {
      embedding_type: embeddingType,
      filters: filters,
      search_terms: query,
      original_query: query
    };
  }
}
