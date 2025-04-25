import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';

// Setup environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to find the project root directory
function findProjectRoot(startDir:string) {
  // Start from the current directory and move up until we find package.json
  let currentDir = startDir;
  
  // Set a limit to prevent infinite loop
  let attempts = 10;
  while (attempts > 0) {
    // Check if package.json exists in the current directory
    const packageJsonPath = join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir; // Found the project root
    }
    
    // Move up one directory
    const parentDir = dirname(currentDir);
    
    // If we reached the filesystem root, stop searching
    if (parentDir === currentDir) {
      break;
    }
    
    currentDir = parentDir;
    attempts--;
  }
  
  // If we couldn't find the project root, use a relative path as fallback
  return resolve(__dirname, '../..');
}

// Find the project root directory
const projectRoot = findProjectRoot(__dirname);

// Load .env file from project root
dotenv.config({ path: join(projectRoot, '.env') });

console.log(`[CONFIG] Loading .env from: ${join(projectRoot, '.env')}`);

// Environment variables
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
export const CLIENT_API_KEY = process.env.MCP_CLIENT_API_KEY || '';

// Tool constants
export const TOOL_NAMES = {
  PERSIST_SUMMARY_TO_STORAGE: "persist-summary-to-storage",
  LOAD_SUMMARY_FROM_STORAGE: "load-summary-from-storage",
  LIST_SUMMARIES: "list-summaries",
  DELETE_SUMMARY: "delete-summary"
};

// Validate environment variables
export function validateEnv() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set');
    process.exit(1);
  }

  if (!CLIENT_API_KEY) {
    console.error('Error: MCP_CLIENT_API_KEY environment variable must be set');
    process.exit(1);
  }
}