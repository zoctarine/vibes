import React, { useState } from 'react';
import { X } from 'lucide-react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  Textarea,
  IconButton,
} from '@chakra-ui/react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { createProject } from '../../api/projects';
import { Project } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const project = await createProject({
        name,
        description: description || undefined,
        owner_id: user.id,
      });
      onProjectCreated(project);
      onClose();
    } catch (err) {
      setError('Failed to create project. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <Text fontSize="lg" fontWeight="medium" color="gray.900">
              Create new project
            </Text>
            <Text mt="1" fontSize="sm" color="gray.500">
              Fill in the details for your new project
            </Text>
            <IconButton
              icon={<X size={20} />}
              onClick={onClose}
              aria-label="Close modal"
              position="absolute"
              right="4"
              top="4"
              variant="ghost"
              color="gray.400"
              _hover={{ color: 'gray.500' }}
            />
          </ModalHeader>

          <ModalBody>
            {error && (
              <Text color="red.600" fontSize="sm" mb="4">
                {error}
              </Text>
            )}

            <Input
              label="Project name"
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              mb="4"
            />

            <Text fontSize="sm" fontWeight="medium" color="gray.700" mb="1">
              Description (optional)
            </Text>
            <Textarea
              id="project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description of your project"
              size="sm"
            />
          </ModalBody>

          <ModalFooter bg="gray.50" borderTopWidth="1px">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              mr="3"
            >
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              isDisabled={isLoading}
            >
              Cancel
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default CreateProjectModal;