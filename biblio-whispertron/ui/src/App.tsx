import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Button, Paper, Typography, Container, ThemeProvider, createTheme, Collapse } from '@mui/material';
import ReactMarkdown from 'react-markdown';

// Create a custom theme with lighter colors
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a90e2', // Lighter blue
      light: '#6ba7e8', // Even lighter blue for user messages
      contrastText: '#ffffff', // White text
    },
  },
  typography: {
    fontFamily: 'Trebuchet MS, sans-serif',
  },
});

interface Message {
  text: string;
  isUser: boolean;
}

interface DebugInfo {
  request: {
    prompt: string;
    searchResults: string;
    conversationHistory: string;
    userWantsSuggestions: boolean;
  };
  response: {
    geminiResponse: string;
  };
}

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      console.log('API Response:', data);
      
      // Store debug info
      if (data.debug) {
        console.log('Setting debug info:', data.debug);
        setDebugInfo({
          request: {
            prompt: data.debug.prompt,
            searchResults: data.debug.searchResults,
            conversationHistory: data.debug.conversationHistory,
            userWantsSuggestions: data.debug.userWantsSuggestions
          },
          response: {
            geminiResponse: data.debug.geminiResponse
          }
        });
      } else {
        console.log('No debug info in response');
      }
      
      // Add bot response
      setMessages(prev => [...prev, { text: data.response, isUser: false }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { text: 'Sorry, there was an error processing your request.', isUser: false }]);
    }
    
    setInput('');
  };

  // Add a debug log for the debugInfo state
  useEffect(() => {
    console.log('Current debugInfo:', debugInfo);
  }, [debugInfo]);

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
         Biblio Whispertron
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
                    overflow: 'auto',
                    fontFamily: 'Trebuchet MS, sans-serif'
                  },
                  '& code': {
                    backgroundColor: 'grey.200',
                    p: 0.5,
                    borderRadius: 0.5,
                    fontFamily: 'Trebuchet MS, sans-serif'
                  },
                  '& p, & li, & h1, & h2, & h3, & h4, & h5, & h6': {
                    fontFamily: 'Trebuchet MS, sans-serif'
                  }
                }}
              >
                {msg.isUser ? (
                  <Typography sx={{ color: 'white' }}>{msg.text}</Typography>
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

        {debugInfo && (
          <Box sx={{ mt: 2, border: '1px solid red' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 }
              }}
              onClick={() => setShowDebug(!showDebug)}
            >
              <Typography variant="subtitle2">
                {showDebug ? 'Hide Gemini API Details' : 'Show Gemini API Details'}
              </Typography>
            </Box>
            <Collapse in={showDebug}>
              <Paper sx={{ p: 2, mt: 1, backgroundColor: 'grey.100' }}>
                <Typography variant="subtitle2" gutterBottom>Conversation History:</Typography>
                <pre style={{ 
                  backgroundColor: 'grey.200', 
                  padding: '8px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {debugInfo.request.conversationHistory}
                </pre>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Search Results:</Typography>
                <pre style={{ 
                  backgroundColor: 'grey.200', 
                  padding: '8px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {debugInfo.request.searchResults}
                </pre>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>User Preferences:</Typography>
                <pre style={{ 
                  backgroundColor: 'grey.200', 
                  padding: '8px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {`User wants suggestions: ${debugInfo.request.userWantsSuggestions}`}
                </pre>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Complete Gemini Prompt:</Typography>
                <pre style={{ 
                  backgroundColor: 'grey.200', 
                  padding: '8px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {debugInfo.request.prompt}
                </pre>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Raw Gemini Response:</Typography>
                <pre style={{ 
                  backgroundColor: 'grey.200', 
                  padding: '8px', 
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontFamily: 'Trebuchet MS, sans-serif',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word'
                }}>
                  {debugInfo.response.geminiResponse}
                </pre>
              </Paper>
            </Collapse>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App; 