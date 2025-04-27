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
    title: 'Task Management App',
    description: 'A collaborative task management tool with real-time updates and team permissions.',
    imageUrl: 'https://images.pexels.com/photos/6804604/pexels-photo-6804604.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/yourusername/task-manager',
    technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
    category: 'Frontend',
  },
  {
    id: '3',
    title: 'Weather Forecast API',
    description: 'RESTful API for weather forecasting with geolocation support and historical data.',
    imageUrl: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/yourusername/weather-api',
    liveUrl: 'https://weather-api.example.com',
    technologies: ['Python', 'Flask', 'PostgreSQL', 'Docker'],
    category: 'Backend',
  },
  {
    id: '4',
    title: 'Mobile Fitness Tracker',
    description: 'Cross-platform mobile app for tracking workouts, nutrition, and fitness goals.',
    imageUrl: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/yourusername/fitness-tracker',
    technologies: ['React Native', 'Redux', 'Firebase'],
    category: 'Mobile',
    featured: true,
  },
  {
    id: '5',
    title: 'Portfolio Website',
    description: 'Personal portfolio website with animated transitions and responsive design.',
    imageUrl: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/yourusername/portfolio',
    liveUrl: 'https://yourusername.dev',
    technologies: ['React', 'Tailwind CSS', 'Framer Motion'],
    category: 'Frontend',
  },
  {
    id: '6',
    title: 'Blockchain Explorer',
    description: 'Web application for exploring and visualizing blockchain transactions and addresses.',
    imageUrl: 'https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    githubUrl: 'https://github.com/yourusername/blockchain-explorer',
    technologies: ['React', 'Node.js', 'Web3.js', 'D3.js'],
    category: 'Full Stack',
  },
  {
    id: '7',
    title: 'This very site',
    description: 'The Vibes project list presented in a nice interface',
    imageUrl: 'https://images.pexels.com/photos/8386434/pexels-photo-8386434.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
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