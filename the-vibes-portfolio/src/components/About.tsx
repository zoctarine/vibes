import React from 'react';
import { Code, Settings, Server, Smartphone, Zap, Award } from 'lucide-react';

const About: React.FC = () => {
  const skills = [
    { name: 'Frontend Development', icon: <Code size={24} />, description: 'Creating responsive and interactive user interfaces with modern frameworks' },
    { name: 'Backend Development', icon: <Server size={24} />, description: 'Building scalable server-side applications and APIs' },
    { name: 'Mobile Development', icon: <Smartphone size={24} />, description: 'Developing cross-platform mobile apps for iOS and Android' },
    { name: 'System Design', icon: <Settings size={24} />, description: 'Architecting robust systems with scalability in mind' },
    { name: 'Performance Optimization', icon: <Zap size={24} />, description: 'Improving application speed and efficiency' },
    { name: 'UI/UX Design', icon: <Award size={24} />, description: 'Creating intuitive and beautiful user experiences' },
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-blue-700 opacity-20 blur-3xl"></div>
        <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-purple-600 opacity-20 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              About Me
            </h2>
            
            <p className="text-gray-300 mb-6">
              I'm a passionate software developer with a strong foundation in both frontend and backend technologies. 
              With 5+ years of experience, I've worked on a variety of projects, from responsive websites to complex web applications.
            </p>
            
            <p className="text-gray-300 mb-6">
              My approach combines technical expertise with creative problem-solving to build performant, 
              scalable, and user-friendly applications. I'm constantly learning and exploring new technologies 
              to stay at the forefront of web development.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'SQL', 'GraphQL', 'AWS', 'Docker'].map((tech, index) => (
                <span key={index} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <div 
                key={index} 
                className="p-6 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-900/10"
              >
                <div className="mb-4 text-blue-400">{skill.icon}</div>
                <h3 className="font-bold text-white mb-2">{skill.name}</h3>
                <p className="text-gray-400 text-sm">{skill.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;