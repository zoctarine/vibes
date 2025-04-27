import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import { Project, Category } from '../types';
import { categories } from '../data/projects';

interface ProjectsGridProps {
  projects: Project[];
}

const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects }) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [isLoading, setIsLoading] = useState(true);

  // Filter projects when category changes
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate loading time for animation
    const timer = setTimeout(() => {
      if (selectedCategory === 'All') {
        setFilteredProjects(projects);
      } else {
        setFilteredProjects(
          projects.filter(project => project.category === selectedCategory)
        );
      }
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedCategory, projects]);

  return (
    <section id="projects" className="py-10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          Vibes
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            These are proof-of-concept applications and early prototypes—not production-ready software. They represent first iterations and experimental explorations rather than polished products. The focus here is on rapid experimentation and learning through the collaborative human-AI development process.
          </p>
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category as Category)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Projects grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } mb-20`}>
          {filteredProjects.map(project => (
            <div 
              key={project.id}
              className="h-full flex">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
        
        {/* Empty state */}
        {filteredProjects.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <p className="text-gray-400">No projects found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProjectsGrid;