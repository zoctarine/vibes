import React, { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  Divider,
  useClipboard,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Code,
  HStack,
} from '@chakra-ui/react';
import { getApiKeys, createApiKey, revokeApiKey, deleteApiKey } from '../api/apiKeys';
import { ApiKey } from '../types';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Input from '../components/ui/Input';

const ApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyExpiry, setNewKeyExpiry] = useState('');
  const [createdKey, setCreatedKey] = useState<ApiKey | null>(null);
  const { onCopy } = useClipboard(createdKey?.key || '');
  const [deleteKeyId, setDeleteKeyId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [revokeKeyId, setRevokeKeyId] = useState<string | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const keys = await getApiKeys();
      setApiKeys(keys);
    } catch (err) {
      setError('Failed to load API keys. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);
    
    try {
      const expiryDate = newKeyExpiry ? new Date(newKeyExpiry) : undefined;
      const key = await createApiKey(newKeyName, expiryDate);
      setApiKeys([key, ...apiKeys]);
      setCreatedKey(key);
      setNewKeyName('');
      setNewKeyExpiry('');
    } catch (err) {
      setError('Failed to create API key. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!id) return;
    
    try {
      await revokeApiKey(id);
      setApiKeys(
        apiKeys.map(key => 
          key.id === id ? { ...key, revoked: true } : key
        )
      );
    } catch (err) {
      setError('Failed to revoke API key. Please try again.');
      console.error(err);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!id) return;
    
    try {
      await deleteApiKey(id);
      setApiKeys(apiKeys.filter(key => key.id !== id));
    } catch (err) {
      setError('Failed to delete API key. Please try again.');
      console.error(err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <VStack spacing="6" align="stretch">
      <Heading size="lg" color="gray.900">API Keys</Heading>

      {error && (
        <Alert
          variant="error"
          isDismissable
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {createdKey && (
        <Alert
          variant="success"
          isDismissable
          onDismiss={() => setCreatedKey(null)}
        >
          <VStack align="stretch" spacing="2">
            <Text fontWeight="medium">API key created successfully</Text>
            <Box bg="green.50" p="2" borderWidth="1px" borderColor="green.200" rounded="md">
              <Text fontSize="xs" color="green.800" mb="1">
                This is the only time you'll see this key. Make sure to copy it now:
              </Text>
              <Box position="relative">
                <Code
                  p="2"
                  bg="white"
                  borderWidth="1px"
                  borderColor="green.300"
                  rounded="md"
                  fontSize="sm"
                  width="full"
                  wordBreak="break-all"
                >
                  {createdKey.key}
                </Code>
                <Button
                  position="absolute"
                  right="2"
                  top="50%"
                  transform="translateY(-50%)"
                  size="xs"
                  variant="outline"
                  onClick={onCopy}
                >
                  Copy
                </Button>
              </Box>
            </Box>
          </VStack>
        </Alert>
      )}

      <Card borderWidth="1px" borderColor="gray.200">
        <CardHeader 
          title="Create new API key" 
          description="API keys allow access to your documents through the API"
        />
        <CardContent>
          <form onSubmit={handleCreateKey}>
            <VStack spacing="4" align="stretch">
              <Input
                label="Key name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Development, Production"
                required
              />
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="1">
                  Expiry date (optional)
                </Text>
                <Input
                  type="date"
                  value={newKeyExpiry}
                  onChange={(e) => setNewKeyExpiry(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </Box>
              
              <Box pt="2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isCreating}
                  leftIcon={<Plus size={18} />}
                >
                  Create API Key
                </Button>
              </Box>
            </VStack>
          </form>
        </CardContent>
      </Card>

      <Heading size="md" color="gray.900" mt="4">Your API Keys</Heading>

      {isLoading ? (
        <Flex justify="center" py="8">
          <Box
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
      ) : apiKeys.length > 0 ? (
        <VStack spacing="4" align="stretch">
          {apiKeys.map((key) => (
            <Card 
              key={key.id} 
              borderWidth="1px"
              borderColor={key.revoked ? 'red.200' : 'gray.200'}
              bg={key.revoked ? 'red.50' : 'white'}
            >
              <CardContent p="4">
                <Flex alignItems="start" justifyContent="space-between">
                  <Flex alignItems="start" gap="3">
                    <Box
                      p="2"
                      rounded="md"
                      bg={key.revoked ? 'red.100' : 'blue.50'}
                      color={key.revoked ? 'red.600' : 'blue.600'}
                    >
                      <Icon as={Key} boxSize="5" />
                    </Box>
                    <Box>
                      <Flex alignItems="center" gap="2">
                        <Heading size="md" color="gray.900">
                          {key.name}
                        </Heading>
                        {key.revoked && (
                          <Text
                            fontSize="xs"
                            fontWeight="medium"
                            px="2"
                            py="0.5"
                            bg="red.100"
                            color="red.800"
                            rounded="full"
                          >
                            Revoked
                          </Text>
                        )}
                      </Flex>
                      <HStack spacing="4" mt="1" fontSize="sm" color="gray.500" flexWrap="wrap">
                        <Flex alignItems="center">
                          <Icon as={Calendar} boxSize="4" mr="1" />
                          <Text>Created: {formatDate(key.created_at)}</Text>
                        </Flex>
                        {key.expires_at && (
                          <Flex alignItems="center">
                            <Icon as={Clock} boxSize="4" mr="1" />
                            <Text>Expires: {formatDate(key.expires_at)}</Text>
                          </Flex>
                        )}
                        {key.last_used_at && (
                          <Flex alignItems="center">
                            <Icon as={Clock} boxSize="4" mr="1" />
                            <Text>Last used: {formatDate(key.last_used_at)}</Text>
                          </Flex>
                        )}
                      </HStack>
                    </Box>
                  </Flex>
                  <HStack spacing="2">
                    {!key.revoked && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setRevokeKeyId(key.id);
                          setIsRevokeDialogOpen(true);
                        }}
                      >
                        Revoke
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      colorScheme="red"
                      size="sm"
                      leftIcon={<Trash2 size={16} />}
                      leftIcon={<Icon as={Trash2} color="red.500" boxSize="4" />}
                      onClick={() => {
                        setDeleteKeyId(key.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </HStack>
                </Flex>
              </CardContent>
            </Card>
          ))}
        </VStack>
      ) : (
        <Card>
          <CardContent>
            <VStack py="12" spacing="4" align="center">
              <Box p="4" bg="blue.50" rounded="full">
                <Icon as={Key} boxSize="10" color="blue.500" />
              </Box>
              <Heading size="md" color="gray.900">No API keys yet</Heading>
              <Text color="gray.500" maxW="md" textAlign="center">
                Create an API key to access your documents programmatically
              </Text>
            </VStack>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete API Key
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this API key? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                colorScheme="red"
                onClick={() => {
                  if (deleteKeyId) {
                    handleDeleteKey(deleteKeyId);
                  }
                  setIsDeleteDialogOpen(false);
                  setDeleteKeyId(null);
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <AlertDialog
        isOpen={isRevokeDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsRevokeDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Revoke API Key
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to revoke this API key? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsRevokeDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                colorScheme="red"
                onClick={() => {
                  if (revokeKeyId) {
                    handleRevokeKey(revokeKeyId);
                  }
                  setIsRevokeDialogOpen(false);
                  setRevokeKeyId(null);
                }}
                ml={3}
              >
                Revoke
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default ApiKeysPage;