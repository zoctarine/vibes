import React from 'react';
import { Box, Flex, Heading, Text, BoxProps } from '@chakra-ui/react';

interface CardProps extends BoxProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', onClick, ...props }) => {
  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
      overflow="hidden"
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Box>
  );
};

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ 
  title, 
  description, 
  action 
}) => {
  return (
    <Box px={5} py={4} borderBottom="1px" borderColor="gray.200">
      <Flex alignItems="center" justifyContent="space-between">
        <Box>
          <Heading as="h3" size="md" color="gray.900">
            {title}
          </Heading>
          {description && (
            <Text mt={1} fontSize="sm" color="gray.500">
              {description}
            </Text>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Flex>
    </Box>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode, className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <Box p={5} className={className}>{children}</Box>;
};

export const CardFooter: React.FC<{ children: React.ReactNode, className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <Box px={5} py={4} bg="gray.50" borderTop="1px" borderColor="gray.200" className={className}>
      {children}
    </Box>
  );
};

export default Card;