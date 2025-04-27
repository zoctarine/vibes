import React from 'react';
import { Github, ArrowUp, Bot, Sparkles, Brain, Terminal, Workflow } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            AI Tools
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-w-3xl mx-auto">
            <a 
              href="https://bolt.new"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Bot className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">Bolt.new</span>
            </a>
            <a 
              href="https://chat.openai.com"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Sparkles className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">ChatGPT</span>
            </a>
            <a 
              href="https://docs.anthropic.com/claude/code"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Brain className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">Claude Code</span>
            </a>
            <a 
              href="https://claude.ai/download"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Terminal className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">Claude Desktop</span>
            </a>
            <a 
              href="https://www.cursor.com"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Terminal className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">Cursor</span>
            </a>
            <a 
              href="https://github.com/features/copilot"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Github className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">GitHub Copilot</span>
            </a>
            <a 
              href="https://www.jetbrains.com/ai"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Sparkles className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">JetBrains AI</span>
            </a>
            <a 
              href="https://www.jetbrains.com/junie"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Bot className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">JetBrains Junie</span>
            </a>
            <a 
              href="https://www.langflow.org"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex flex-col items-center p-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors">
              <Workflow className="w-4 h-4 text-blue-400 mb-1" />
              <span className="text-gray-300 text-xs">Langflow</span>
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <a 
              href="https://github.com/zoctarine/vibes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Github size={20} />
            </a>
            <span className="text-gray-500 text-sm">
              © {new Date().getFullYear()} zoctarine
            </span>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            Back to top <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;