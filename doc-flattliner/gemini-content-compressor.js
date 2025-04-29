// gemini-content-compressor.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Initializes the Gemini API client
 * 
 * @param {string} apiKey - Your Gemini API key
 * @returns {object} - The configured Gemini client
 */
function initializeGeminiAPI(apiKey) {
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Compresses markdown content while preserving links using Gemini API
 * 
 * @param {object} genAI - Initialized Gemini API client
 * @param {string} markdownContent - The original markdown content to compress
 * @param {string} compressionLevel - Compression level: "light", "medium", or "aggressive"
 * @returns {Promise<string>} - The compressed markdown content
 */
async function compressContent(genAI, markdownContent, compressionLevel = "medium") {
  try {
    // Select the appropriate model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Configure compression instructions based on level
    let compressionInstructions;
    if (compressionLevel === "light") {
      compressionInstructions = "Make minimal changes, focus only on obvious redundancies.";
    } else if (compressionLevel === "aggressive") {
      compressionInstructions = "Aggressively compress the content while still preserving all links and key information.";
    } else { // medium (default)
      compressionInstructions = "Make the content more concise while preserving all links and key information.";
    }

    // Build the prompt with careful instructions to preserve links
    const prompt = `
I need you to compress the following Markdown content while preserving ALL of the following:
1. All links and their anchor text (these are absolutely critical)
2. All essential information and main points
3. All code blocks and their content
4. All key terminology and definitions

What to minimize:
1. Remove redundant explanations or examples
2. Make lengthy paragraphs more concise
3. Convert verbose lists into more compact forms
4. Simplify overly complex sentences
5. Remove unnecessary adverbs and filler words

Special instructions: ${compressionInstructions}

Rules:
- NEVER remove any links or change their URLs
- Preserve all section headers and their hierarchy
- Keep all information but express it more efficiently
- Maintain the document's overall structure
- All content must remain factually accurate

Here is the Markdown content to compress:

${markdownContent}

Return only the compressed Markdown without explanations.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const compressedContent = response.text();
    
    return compressedContent;
  } catch (error) {
    console.error("Error compressing content with Gemini:", error);
    // In case of error, return the original content
    return markdownContent;
  }
}

/**
 * Processes a large document by splitting it into sections and compressing each
 * 
 * @param {object} genAI - Initialized Gemini API client
 * @param {string} markdownContent - The original markdown content to compress
 * @param {string} compressionLevel - Compression level: "light", "medium", or "aggressive"
 * @returns {Promise<string>} - The compressed markdown content
 */
async function processLargeDocument(genAI, markdownContent, compressionLevel = "medium") {
  const MAX_CHUNK_SIZE = 25000; // Characters per chunk
  
  // If content is small enough, process it directly
  if (markdownContent.length < MAX_CHUNK_SIZE) {
    return await compressContent(genAI, markdownContent, compressionLevel);
  }

  // Split by headers for more intelligent chunking
  const sections = markdownContent.split(/(?=^#+\s+)/m);
  
  // Process sections in batches to avoid overwhelming the API
  const batchSize = 3;
  const compressedSections = [];
  
  for (let i = 0; i < sections.length; i += batchSize) {
    const batch = sections.slice(i, i + batchSize);
    
    // Combine small sections if they're below threshold
    const batchesToProcess = [];
    let currentBatch = "";
    
    for (const section of batch) {
      if (currentBatch.length + section.length < MAX_CHUNK_SIZE) {
        currentBatch += section;
      } else {
        if (currentBatch.length > 0) {
          batchesToProcess.push(currentBatch);
        }
        currentBatch = section;
      }
    }
    
    if (currentBatch.length > 0) {
      batchesToProcess.push(currentBatch);
    }
    
    // Process each combined batch
    const batchPromises = batchesToProcess.map(batch => 
      compressContent(genAI, batch, compressionLevel)
    );
    
    // Wait for all batches in this group to complete
    const compressed = await Promise.all(batchPromises);
    compressedSections.push(...compressed);
    
    // Add a small delay between batch groups to avoid rate limits
    if (i + batchSize < sections.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return compressedSections.join('\n\n');
}

/**
 * Compress content with retry mechanism for error handling
 * 
 * @param {object} genAI - Initialized Gemini API client
 * @param {string} markdownContent - The original markdown content to compress
 * @param {string} compressionLevel - Compression level: "light", "medium", or "aggressive"
 * @param {number} retries - Number of retry attempts
 * @returns {Promise<string>} - The compressed markdown content
 */
async function compressWithRetry(genAI, markdownContent, compressionLevel = "medium", retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await processLargeDocument(genAI, markdownContent, compressionLevel);
    } catch (error) {
      console.error(`Attempt ${i+1} failed:`, error);
      if (i === retries - 1) {
        console.error("All retry attempts failed, returning original content");
        return markdownContent; // Return original if all retries fail
      }
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

// Example usage
async function example() {
  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = initializeGeminiAPI(apiKey);
  
  const originalContent = `
# Documentation
  
## Introduction
  
This is a detailed introduction to our product. It contains a lot of information about how to get started with our service.
  
Here's a [link to our website](https://example.com) that you should definitely check out.
  
## Installation
  
Follow these detailed steps to install:
1. First, download the package from our repository
2. Next, extract the files to your preferred location
3. Then, run the setup script
4. Finally, configure the environment variables
  
For more information, see the [detailed installation guide](https://example.com/install).
`;
  
  const compressed = await compressWithRetry(genAI, originalContent, "medium");
  console.log(compressed);
}

module.exports = {
  initializeGeminiAPI,
  compressContent,
  processLargeDocument,
  compressWithRetry
};