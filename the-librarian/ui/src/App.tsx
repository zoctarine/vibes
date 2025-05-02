import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Container } from '@mui/material';
import ReactMarkdown from 'react-markdown';

function App() {
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    
    try {
      const res = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
      const data = await res.json();
      
      // Add bot response
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: 'Sorry, there was an error processing your request.', isUser: false }]);
    }
    
    setInput('');
  };

  return (
    <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
        Library Chat
      </Typography>
      
      <Paper 
        elevation={3}
        sx={{ 
          flex: 1,
          overflow: 'auto',
          p: 2,
          mb: 2,
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {messages.map((msg, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: msg.isUser ? 'primary.light' : 'grey.100',
                maxWidth: '80%',
                borderRadius: 2,
                '& pre': {
                  backgroundColor: 'grey.200',
                  p: 1,
                  borderRadius: 1,
                  overflow: 'auto'
                },
                '& code': {
                  backgroundColor: 'grey.200',
                  p: 0.5,
                  borderRadius: 0.5
                }
              }}
            >
              {msg.isUser ? (
                <Typography>{msg.text}</Typography>
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </Paper>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about books..."
            variant="outlined"
            autoComplete="off"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
          />
          <Button 
            type="submit" 
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3
            }}
          >
            Send
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default App; 