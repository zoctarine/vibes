import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, FileText, Search } from 'lucide-react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Flex,
  IconButton,
  InputGroup,
  InputLeftElement,
  Wrap,
  WrapItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Textarea,
  Divider,
  Icon,
} from '@chakra-ui/react';
import { Trash2 } from 'lucide-react';
import { getProject, deleteProject, updateProject } from '../api/projects';
import { getDocuments, searchDocuments } from '../api/documents';
import { Project, Document } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import DocumentItem from '../components/documents/DocumentItem';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableProject, setEditableProject] = useState<Partial<Project>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const fetchProject = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const projectData = await getProject(id);
      setProject(projectData);
      setEditableProject({
        name: projectData.name,
        description: projectData.description,
      });
    } catch (err) {
      setError('Failed to load project. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!id) return;
    
    try {
      const docs = await getDocuments(id);
      // Ensure docs is an array before setting state
      const docsArray = Array.isArray(docs) ? docs : [];
      setDocuments(docsArray);
      setFilteredDocuments(docsArray);
      
      // Extract all unique tags from valid documents array
      const tags = Array.from(
        new Set(docsArray.flatMap(doc => doc.tags || []))
      ).sort();
      setAllTags(tags);
    } catch (err) {
      console.error('Failed to load documents:', err);
      // Set empty arrays on error to prevent mapping issues
      setDocuments([]);
      setFilteredDocuments([]);
      setAllTags([]);
    }
  };

  useEffect(() => {
    fetchProject();
    fetchDocuments();
  }, [id]);

  useEffect(() => {
    // Ensure documents is an array before filtering
    if (!Array.isArray(documents)) {
      setFilteredDocuments([]);
      return;
    }

    const filtered = documents.filter(doc => {
      const matchesSearch = !searchQuery || 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => doc.tags?.includes(tag));
      
      return matchesSearch && matchesTags;
    });
    setFilteredDocuments(filtered);
  }, [documents, searchQuery, selectedTags]);

  const handleDeleteProject = async () => {
    if (!id) return;
    
    try {
      await deleteProject(id);
      navigate('/');
    } catch (err) {
      setError('Failed to delete project. Please try again.');
      console.error(err);
    }
  };

  const handleSaveProjectEdit = async () => {
    if (!id || !project) return;
    
    try {
      const updatedProject = await updateProject(id, editableProject);
      setProject(updatedProject);
      setIsEditMode(false);
    } catch (err) {
      setError('Failed to update project. Please try again.');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (project === undefined) {
    return null;
  }

  if (project === null) {
    return (
      <Alert variant="error">Project not found</Alert>
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

      <Card borderWidth="1px" borderColor="gray.200">
        <CardContent className="p-6">
          {isEditMode ? (
            <VStack spacing="4" align="stretch">
              <Input
                label="Project name"
                value={editableProject.name || ''}
                onChange={(e) => setEditableProject({ ...editableProject, name: e.target.value })}
              />
              
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="1">
                  Description
                </Text>
                <Textarea
                  rows={3}
                  value={editableProject.description || ''}
                  onChange={(e) => setEditableProject({ ...editableProject, description: e.target.value })}
                  size="sm"
                />
              </Box>
              
              <HStack justify="flex-end" pt="4" spacing="3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditableProject({
                      name: project.name,
                      description: project.description,
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveProjectEdit}>
                  Save
                </Button>
              </HStack>
            </VStack>
          ) : (
            <Box>
              <Flex justify="space-between" alignItems="flex-start">
                <Box>
                  <Heading as="h1" size="xl" color="gray.900" mb="2">
                    {project.name}
                  </Heading>
                  {project.description && (
                    <Text color="gray.600" mb="4">{project.description}</Text>
                  )}
                  <HStack spacing="4" fontSize="sm" color="gray.500">
                    <Text>
                      Created: {formatDate(project.created_at)}
                    </Text>
                    <Text>
                      Updated: {formatDate(project.updated_at)}
                    </Text>
                    <Text>
                      Documents: {documents.length}
                    </Text>
                  </HStack>
                </Box>
                <HStack spacing="2">
                  <Button
                    variant="outline"
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
                </HStack>
              </Flex>
            </Box>
          )}
        </CardContent>
      </Card>

      <Flex align="center" justify="space-between" mb="4">
        <Heading as="h2" size="lg" color="gray.900">Documents</Heading>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate(`/projects/${id}/documents/new`)}
        >
          New Document
        </Button>
      </Flex>

      <Flex
        direction={{ base: "column", md: "row" }}
        gap="4"
        mb="4"
      >
        <Box flex="1">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftElement={<Icon as={Search} boxSize="4" />}
          />
        </Box>
        
        {allTags.length > 0 && (
          <Box flex="1">
            <Wrap spacing="2">
              {allTags.map(tag => (
                <WrapItem key={tag}>
                  <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'primary' : 'default'}
                  cursor="pointer"
                  transition="colors 0.2s"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => {
                    setSelectedTags(prev => {
                      const isSelected = prev.includes(tag);
                      return isSelected 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag];
                    });
                  }}
                >
                  {tag}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}
      </Flex>

      {Array.isArray(documents) && documents.length > 0 ? (
        <VStack spacing="4" align="stretch">
          {(Array.isArray(filteredDocuments) && filteredDocuments.length > 0 ? filteredDocuments : (
            <Card className="bg-white border border-gray-200">
              <CardContent className="flex flex-col items-center justify-center text-center py-12">
                <Box mb="4" p="4" bg="blue.50" rounded="full">
                  <Icon as={FileText} boxSize="10" color="blue.500" />
                </Box>
                <Heading as="h3" size="md" color="gray.900" mb="2">No matching documents</Heading>
                <Text color="gray.500" maxW="md" mb="6">
                  Try adjusting your search or filters
                </Text>
              </CardContent>
            </Card>
          )).map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              onClick={() => navigate(`/projects/${project.id}/documents/${doc.id}`)}
              className="hover:border-blue-300 transition-all duration-200"
            />
          ))}
        </VStack>
      ) : (
        <Card className="bg-white border border-gray-200">
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <Box mb="4" p="4" bg="blue.50" rounded="full">
              <Icon as={FileText} boxSize="10" color="blue.500" />
            </Box>
            <Heading as="h3" size="md" color="gray.900" mb="2">No documents yet</Heading>
            <Text color="gray.500" maxW="md" mb="6">
              Create your first document in this project
            </Text>
            <Button
              variant="primary"
              leftIcon={<Plus size={18} />}
              onClick={() => navigate(`/projects/${id}/documents/new`)}
            >
              New Document
            </Button>
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
              Delete Project
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this project? This action cannot be undone.
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
                  handleDeleteProject();
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

export default ProjectDetailPage;