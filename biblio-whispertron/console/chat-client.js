const readline = require('readline');
const fetch = require('node-fetch'); // npm install node-fetch@2

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask() {
  rl.question('You: ', async (input) => {
    // Check for exit commands
    if (['exit', 'quit', 'bye'].includes(input.toLowerCase())) {
      console.log('Goodbye!');
      rl.close();
      process.exit(0);
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
      const data = await res.json();
      console.log('Bot:', data.response);
    } catch (error) {
      console.error('Error:', error.message);
    }
    ask();
  });
}

console.log('Welcome to the Biblio Whispertron! Type your questions about books.');
console.log('Type "exit", "quit", or "bye" to quit.\n');
ask(); 