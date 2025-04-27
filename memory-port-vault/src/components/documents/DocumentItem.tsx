import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { Box, Flex, Text, Icon } from '@chakra-ui/react';
import { Document } from '../../types';
import Card, { CardContent } from '../ui/Card';
import Badge from '../ui/Badge';

interface DocumentItemProps {
  document: Document;
  onClick?: () => void;
  className?: string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  onClick,
  className = '' 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      borderWidth="1px"
      borderColor="gray.200"
      transition="all 0.2s"
      _hover={{
        borderColor: 'blue.300',
        shadow: 'md'
      }}
      cursor="pointer"
      className={className}
    >
      <CardContent>
        <Flex>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            w="10"
            h="10"
            bg="blue.50"
            color="blue.600"
            borderRadius="md"
            mr="3"
          >
            <Icon as={FileText} boxSize="5" />
          </Box>
          <Box flex="1">
            <Text
              fontSize="base"
              fontWeight="medium"
              color="gray.900"
            >
              {document.title}
            </Text>
            <Flex
              alignItems="center"
              fontSize="xs"
              color="gray.500"
              mt="0.5"
            >
              <Flex alignItems="center">
                <Icon as={Calendar} boxSize="3" mr="1" />
                <Text>Updated {formatDate(document.updated_at)}</Text>
              </Flex>
              {document.tags && document.tags.length > 0 && (
                <Flex alignItems="center" ml="3" gap="1">
                  {document.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      fontSize="xs"
                      px="1.5"
                      py="0.5"
                    >
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              )}
            </Flex>
          </Box>
        </Flex>
      </CardContent>
    </Card>
  );
};

export default DocumentItem;