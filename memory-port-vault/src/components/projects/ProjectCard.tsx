import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { Box, Flex, Text, Icon, Heading } from '@chakra-ui/react';
import { Project } from '../../types';
import Card, { CardContent } from '../ui/Card';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card 
      borderWidth="1px"
      borderColor="gray.200"
      transition="all 0.2s"
      _hover={{
        borderColor: 'blue.300',
        shadow: 'md'
      }}
    >
      <CardContent>
        <Flex alignItems="start" justifyContent="space-between">
          <Box flex="1" minW="0">
            <Heading
              as="h3"
              fontSize="lg"
              fontWeight="semibold"
              color="gray.900"
              noOfLines={1}
              mb="1"
            >
              {project.name}
            </Heading>
            {project.description && (
              <Text
                color="gray.500"
                fontSize="sm"
                noOfLines={2}
                mb="4"
              >
                {project.description}
              </Text>
            )}
          </Box>
          <Box
            ml="4"
            flexShrink={0}
            bg="blue.50"
            color="blue.700"
            p="2"
            borderRadius="md"
          >
            <Icon as={FileText} boxSize="5" />
          </Box>
        </Flex>
        
        <Box
          mt="4"
          pt="4"
          borderTopWidth="1px"
          borderColor="gray.100"
        >
          <Flex
            justifyContent="space-between"
            fontSize="sm"
          >
            <Flex alignItems="center" color="gray.500">
              <Icon as={Calendar} boxSize="4" mr="1" />
              <Text>{formatDate(project.created_at)}</Text>
            </Flex>
            <Flex alignItems="center" color="gray.500">
              <Icon as={FileText} boxSize="4" mr="1" />
              <Text>{project.documentCount || 0} documents</Text>
            </Flex>
          </Flex>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;