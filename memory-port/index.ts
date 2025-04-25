import { startServer } from './src/server.js';

console.error("Starting Conversation Summary Manager...");

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});