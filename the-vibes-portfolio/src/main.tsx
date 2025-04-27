import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add some custom styles for scrollbar
const style = document.createElement('style');
style.textContent = `
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
  }
  
  ::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 5px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
  
  /* Smooth scrolling for the whole page */
  html {
    scroll-behavior: smooth;
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);