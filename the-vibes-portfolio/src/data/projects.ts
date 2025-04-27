import { Project } from '../types';

export const projects: Project[] = [
  {
    id: '1',
    title: 'Story O\'Matic - Infinite Adventures',
    description: 'A narrative generator (inspired by choose your own adventure books) designed to craft interactive, branching stories. It’s storytelling, ... infinite storyteling.',
    imageUrl: 'https://darling-choux-1ff693.netlify.app/images/image(1).jpg',
    githubUrl: 'https://github.com/zoctarine/vibes/story-o-matic',
    liveUrl: 'http://www.netlify.app/',
    technologies: ['React', 'Tailwind CSS', 'Typescript', 'Gemini API'],
    category: 'Fun',
    featured: true,
  },
  {
    id: '2',
    title: 'Draft Editor',
    description: 'A simple text editor with Codemirror, that let\'s you edit scenes, chapters, reorder and compile them to a complete document. It also has a fullscreen distraction free view.',
    imageUrl: 'https://images.pexels.com/photos/6804604/pexels-photo-6804604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/zoctarine/vibes/draft-editor',
    liveUrl: 'https://playful-pavlova-7e9618.netlify.app/',
    technologies: ['React', 'Supabase', 'Tailwind CSS', 'codemirror'],
    category: 'Writing',
  },
  {
    id: '3',
    title: 'Prompt Enhancer MCP Server',
    description: 'A Model Context Protocol (MCP) server that enhances prompts by applying best software development practices. Will be enhanced with different prompts',
    imageUrl: 'https://private-user-images.githubusercontent.com/42004632/437295439-3729226b-6472-4ef1-a2ae-33b71e2cb98e.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU3ODQ2NjcsIm5iZiI6MTc0NTc4NDM2NywicGF0aCI6Ii80MjAwNDYzMi80MzcyOTU0MzktMzcyOTIyNmItNjQ3Mi00ZWYxLWEyYWUtMzNiNzFlMmNiOThlLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA0MjclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNDI3VDIwMDYwN1omWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTk4MjQzNTZhMzNkZGVkNzVjZDk0OTc3OWZjMjNiMDBmZGM3MGEyMzliNzZkNWQ5MjA5ZjIxNDI2ZmVhZWZiZTcmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.vl2pILPFJ1wrGpgt3c8S2SV0eJIiPIh7QTOCzabCmqw',
    githubUrl: 'https://github.com/zoctarine/vibes/prompt-enhancer',
    technologies: ['Typescript', 'Docker', 'MCP'],
    category: 'MCP',
  },
  {
    id: '4',
    title: 'Text Statistics MCP server',
    description: 'This project provides tools to extract insights from text, including word and character counts, sentence and paragraph analysis, estimated reading time, and page count calculations for various formats.',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/zoctarine/vibes/blob/main/fiction-writer/text-statistics',
    technologies: ['Typescript', 'MCP'],
    category: 'MCP',
    featured: true,
  },
  {
    id: '5',
    title: 'MemPortVault',
    description: 'A very basic document collection management. It allows users to create projects, store documents, and manage them through API (used by Memory Port Mcp)',
    imageUrl: 'https://private-user-images.githubusercontent.com/42004632/437972051-2e2f31b2-7f0f-425f-8166-8e85a730caf5.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU3ODQ4NDQsIm5iZiI6MTc0NTc4NDU0NCwicGF0aCI6Ii80MjAwNDYzMi80Mzc5NzIwNTEtMmUyZjMxYjItN2YwZi00MjVmLTgxNjYtOGU4NWE3MzBjYWY1LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA0MjclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNDI3VDIwMDkwNFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTc0ZWRhODIzZDg4OTZmZDNjNzllZWJmYWQ1ODhmNDBkMTEwMTFmNTNlNDI4NmZlYWIzMDMwZjU1MTY2OTIzNmUmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.7nlqfRROl6wYB-jCf7wSUUdkDKZrBwoflRbtX6dxm28',
    githubUrl: 'https://github.com/zoctarine/vibes/blob/main/memory-port-vault/',
    liveUrl: 'https://candid-hotteok-3ce691.netlify.app/',
    technologies: ['React', 'Supabase', 'ChakraUI', 'Edge Functions'],
    category: 'Tools',
  },
  {
    id: '6',
    title: 'Memory Port - portable chat summary.',
    description: 'MCP server that allows you to sae and continue conversations with a new client, or in a new chat session, with some memory of the previous conversation.',
    imageUrl: 'https://images.pexels.com/photos/3832028/pexels-photo-3832028.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/zoctarine/memory-port',
    technologies: ['Typescript', 'MCP', 'Supabase', 'MemPortVault', 'Gemini API'],
    category: 'MCP',
  },
  {
    id: '7',
    title: 'This very site',
    description: 'The Vibes project list presented in a nice interface',
    imageUrl: 'https://private-user-images.githubusercontent.com/42004632/437985998-6371d15e-bc52-4ec3-856f-0e2c785e0890.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU3ODQ4MDIsIm5iZiI6MTc0NTc4NDUwMiwicGF0aCI6Ii80MjAwNDYzMi80Mzc5ODU5OTgtNjM3MWQxNWUtYmM1Mi00ZWMzLTg1NmYtMGUyYzc4NWUwODkwLnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNTA0MjclMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjUwNDI3VDIwMDgyMlomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPWYwMWU1OThkODU0MjM0N2U1Y2ZjNmQzOTJiM2JlZjk4ZTc4YzNkOWFmNmU1YTBlNGMzNzlhMTNlMGY1MWE5ZTEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0In0.hBngIWrOna0yiCMPILQqkEiUGo_RwDCqP_6s_Oj5hBw',
    githubUrl: 'https://github.com/zoctarine/vibes/the-vibes-portfolio',
    liveUrl: 'https://gleaming-platypus-039e51.netlify.app/',
    technologies: ['React', 'Tailwind CSS'],
    category: 'Other',
    featured: true,
  }
];

export const categories: string[] = [
  'All',
  'MCP',
  'Writing',
  'Fun',
  'Tools',
  'Other'
];