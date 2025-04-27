import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2, Save, ArrowLeft, Tag, Plus, Link } from 'lucide-react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  Wrap,
  WrapItem,
  Textarea,
  ButtonGroup,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getDocument, updateDocument, deleteDocument, createDocument } from '../api/documents';
import { getProject } from '../api/projects';
import { Document, Project } from '../types';
import Button from '../components/ui/Button';
import Card, { CardContent } from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

const DocumentDetailPage: React.FC = () => {
  const { projectId, id } = useParams<{ projectId: string, id: string }>();
  console.log('Route params:', { projectId, id });
  const navigate = useNavigate();
  const isNewDocument = !id || id === 'new';
  console.log('isNewDocument:', isNewDocument);

  const [document, setDocument] = useState<Document | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(!isNewDocument);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(isNewDocument);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [url, setUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const fetchDocument = async () => {
    if (!id || isNewDocument) {
      console.log('New document detected, skipping fetch');
      setIsLoading(false);
      return;
    }
    
    console.log('fetchDocument called with id:', id);
    setIsLoading(true);
    setError(null);
    
    try {
      const doc = await getDocument(id);
      setDocument(doc);
      setTitle(doc.title);
      setContent(doc.content || '');
      setTags(doc.tags || []);
    } catch (err) {
      setError('Failed to load document. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      const projectData = await getProject(projectId);
      setProject(projectData);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  useEffect(() => {
    fetchDocument();
    fetchProject();
  }, [id, projectId]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const extractContent = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    
    // Extract page title
    const pageTitle = doc.title || '';
    
    const elementsToRemove = doc.querySelectorAll(
      'script, style, link, meta, noscript, iframe, header, footer, nav, aside, [role="banner"], [role="navigation"]'
    );
    elementsToRemove.forEach(el => el.remove());
    
    const mainContent = doc.querySelector('main, article, [role="main"]')?.innerHTML || doc.body.innerHTML;
    
    const content = mainContent
      .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n## $1\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '\n$1\n')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
      
    return { content, title: pageTitle };
  };

  const handleLoadFromUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoadingUrl(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URL content');
      }

      const { html } = await response.json();
      const { content: extractedContent, title: pageTitle } = extractContent(html);
      
      // Set content
      setContent(extractedContent);
      
      // Set title if it's empty or if it's a new document
      if (!title || isNewDocument) {
        setTitle(pageTitle);
      }
      
      setShowUrlInput(false);
      setUrl('');
    } catch (err) {
      setError('Failed to load content from URL. Please try again.');
      console.error(err);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleSave = async () => {
    if (!projectId) return;
    
    console.log('handleSave called:', { isNewDocument, projectId, title, tags });
    setIsSaving(true);
    setError(null);
    
    try {
      if (!title.trim()) {
        setError('Title is required');
        return;
      }

      const savedDoc = isNewDocument
        ? await createDocument({
            project_id: projectId,
            title,
            tags,
          }, content)
        : await updateDocument(
            id!,
            {
              title,
              tags,
            },
            content
          );
      console.log('Document saved:', savedDoc);

      setDocument(savedDoc);
      navigate(`/projects/${projectId}/documents/${savedDoc.id}`);
    } catch (err) {
      setError('Failed to save document. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !projectId) return;
    
    try {
      await deleteDocument(id);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError('Failed to delete document. Please try again.');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!projectId) {
    return (
      <Alert variant="error">Project ID is required</Alert>
    );
  }

  if (!isNewDocument && !document) {
    return <Alert variant="error">Document not found</Alert>;
  }
  
  if (isNewDocument) {
    return (
      <div className="space-y-6">
        {error && (
          <Alert
            variant="error"
            isDismissable
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Back to Project
          </Button>
          
          <Button
            variant="primary"
            leftIcon={<Save size={16} />}
            isLoading={isSaving}
            onClick={handleSave}
          >
            Create
          </Button>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Input
                label="Document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 min-h-[300px]"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setShowUrlInput(false);
                  }}
                  placeholder="Write your document content in Markdown..."
                ></textarea>
                <p className="mt-1 text-xs text-gray-500">
                  Markdown formatting is supported
                </p>
                <div className="mt-2 space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Link size={16} />}
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    Load from URL
                  </Button>
                  
                  {showUrlInput && (
                    <form onSubmit={handleLoadFromUrl} className="flex gap-2">
                      <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Link size={16} className="text-gray-400" />
                        </div>
                        <Input
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          placeholder="https://example.com/article"
                          required
                          className="pl-10"
                          type="url"
                        />
                      </div>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        isLoading={isLoadingUrl}
                      >
                        Load
                      </Button>
                    </form>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <Flex>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={Tag} color="gray.400" boxSize="4" />
                    </InputLeftElement>
                    <Input
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                    />
                  </InputGroup>
                  <Button
                    type="button"
                    variant="outline"
                    ml="2"
                    onClick={handleAddTag}
                  >
                    <Plus size={18} />
                  </Button>
                </Flex>
                
                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="primary"
                        removable
                        onRemove={() => handleRemoveTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <VStack spacing="6" align="stretch">
      {error && (
        <Alert
          variant="error"
          isDismissable
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Flex align="center" justify="space-between">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          Back to Project
        </Button>
        <ButtonGroup spacing="2">
          {isEditMode || isNewDocument ? (
            <Button
              variant="primary"
              leftIcon={<Save size={16} />}
              isLoading={isSaving}
              onClick={handleSave}
            >
              {isNewDocument ? 'Create' : 'Save'}
            </Button>
          ) : !isNewDocument && (
            <ButtonGroup spacing="2">
              <Button
                variant="outline"
                colorScheme="red"
                size="sm"
                leftIcon={<Icon as={Trash2} color="red.500" boxSize="4" />}
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Edit size={16} />}
                onClick={() => setIsEditMode(true)}
              >
                Edit
              </Button>
            </ButtonGroup>
          )}
        </ButtonGroup>
      </Flex>

      <Card borderWidth="1px" borderColor="gray.200">
        <CardContent p="6">
          {isEditMode || isNewDocument ? (
            <VStack spacing="4" align="stretch">
              <Input
                label="Document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="1">
                  Content
                </Text>
                <Textarea
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setShowUrlInput(false);
                  }}
                  placeholder="Write your document content in Markdown..."
                  minH="300px"
                  size="sm"
                ></Textarea>
                <Text mt="1" fontSize="xs" color="gray.500">
                  Markdown formatting is supported
                </Text>
                <VStack mt="2" spacing="2" align="stretch">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Link size={16} />}
                    onClick={() => setShowUrlInput(!showUrlInput)}
                  >
                    Load from URL
                  </Button>
                  
                  {showUrlInput && (
                    <form onSubmit={handleLoadFromUrl}>
                      <HStack spacing="2">
                        <Box flex="1">
                          <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/article"
                            required
                            type="url"
                            leftElement={<Icon as={Link} boxSize="4" />}
                          />
                        </Box>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          isLoading={isLoadingUrl}
                        >
                          Load
                        </Button>
                      </HStack>
                    </form>
                  )}
                </VStack>
              </Box>
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="1">
                  Tags
                </Text>
                <HStack spacing="2">
                  <Box flex="1">
                    <Input
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      leftElement={<Icon as={Tag} boxSize="4" />}
                    />
                  </Box>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    <Plus size={18} />
                  </Button>
                </HStack>
                
                {tags.length > 0 && (
                  <Wrap mt="2" spacing="2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="primary"
                        removable
                        onRemove={() => handleRemoveTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </Wrap>
                )}
              </Box>
            </VStack>
          ) : (
            <Box>
              <Heading as="h1" size="xl" color="gray.900" mb="2">
                {document.title}
              </Heading>
              
              <Flex wrap="wrap" align="center" fontSize="sm" color="gray.500" mb="4" gap="4">
                <div>
                  Created: {formatDate(document.created_at)}
                </div>
                <div>
                  Updated: {formatDate(document.updated_at)}
                </div>
                {project && (
                  <div>
                    Project: {project.name}
                  </div>
                )}
              </Flex>
              
              {document.tags && document.tags.length > 0 && (
                <Wrap mb="6" spacing="2">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="primary">
                      {tag}
                    </Badge>
                  ))}
                </Wrap>
              )}
              
              <Box borderTopWidth="1px" borderColor="gray.200" pt="6">
                {document.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {document.content}
                  </ReactMarkdown>
                ) : (
                  <Text color="gray.500" fontStyle="italic">No content</Text>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Document
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="solid"
                colorScheme="red"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  handleDelete();
                }}
                ml={3}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default DocumentDetailPage;