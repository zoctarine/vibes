import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderPlus, Calendar, File } from 'lucide-react';
import { Box, Flex, Heading, VStack, Icon, Text, SimpleGrid } from '@chakra-ui/react';
import { getProjects } from '../../api/projects';
import { Project } from '../../types';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <VStack spacing="6" align="stretch">
      <Flex alignItems="center" justifyContent="space-between">
        <Heading size="lg" color="gray.900">Projects</Heading>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
      </Flex>

      {error && (
        <Alert
          variant="error"
          isDismissable
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Flex justify="center" py="8">
          <Box
            as="div"
            h="8"
            w="8"
            borderWidth="2px"
            borderStyle="solid"
            borderColor="blue.500"
            borderBottomColor="transparent"
            borderLeftColor="transparent"
            rounded="full"
            animation="spin 1s linear infinite"
          />
        </Flex>
      ) : projects.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing="6">
          {projects.map((project) => (
            <Box 
              key={project.id} 
              cursor="pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <ProjectCard project={project} />
            </Box>
          ))}
        </SimpleGrid>
      ) : (
        <Card className="bg-white border border-gray-200">
          <CardHeader 
            title="No projects yet" 
            description="Create your first project to get started"
          />
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <Box mb="4" p="4" bg="blue.50" rounded="full">
              <Icon as={FolderPlus} boxSize="10" color="blue.500" />
            </Box>
            <Heading as="h3" size="md" color="gray.900" mb="2">Create your first project</Heading>
            <Text color="gray.500" maxW="md" mb="6">
              Start by creating a project to organize your documents and files.
            </Text>
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => setIsModalOpen(true)}
            >
              New Project
            </Button>
          </CardContent>
        </Card>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </VStack>
  );
};

export default ProjectList;