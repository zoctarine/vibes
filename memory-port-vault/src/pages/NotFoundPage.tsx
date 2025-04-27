import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Box, VStack, Icon, Heading, Text, Flex } from '@chakra-ui/react';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <VStack spacing="4" justify="center" minH="70vh" px="4" textAlign="center">
      <Icon as={FileQuestion} boxSize="20" color="blue.500" />
      <Heading size="2xl" color="gray.900">404</Heading>
      <Heading size="lg" color="gray.700">Page Not Found</Heading>
      <Text color="gray.600" maxW="md" mb="4">
        The page you are looking for does not exist or has been moved.
      </Text>
      <Flex gap="4">
        <Button
          variant="primary"
          onClick={() => navigate('/')}
        >
          Go to Projects
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Flex>
    </VStack>
  );
};

export default NotFoundPage;