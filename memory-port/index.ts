import { startServer } from './src/server.js';

console.log("Starting Conversation Summary Manager...");

// Start the server
startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});