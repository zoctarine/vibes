import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vault, UserPlus } from 'lucide-react';
import { Box, Container, VStack, Icon, Heading, Text, Divider } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        setErrorMessage(error.message);
      } else {
        navigate('/login', { 
          state: { message: 'Registration successful. Please sign in.' } 
        });
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" py="12" px={{ base: '4', lg: '8' }} bg="gray.50">
      <Container maxW="md">
        <VStack spacing="8">
          <Icon as={Vault} boxSize="12" color="blue.600" />
          <VStack spacing="2">
            <Heading size="xl" fontWeight="bold">
              Create your account
            </Heading>
            <Text color="gray.600" fontSize="md">
              Start managing your documents with MemPortVault
            </Text>
          </VStack>

          <Box
            py="8"
            px={{ base: '4', md: '10' }}
            shadow="base"
            rounded="lg"
            bg="white"
            w="full"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing="6">
                {errorMessage && (
                  <Alert
                    variant="error"
                    isDismissable
                    onDismiss={() => setErrorMessage(null)}
                  >
                    {errorMessage}
                  </Alert>
                )}

                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  helpText="Must be at least 6 characters"
                />

                <Button
                  type="submit"
                  variant="primary"
                  width="full"
                  isLoading={isLoading}
                  leftIcon={<UserPlus size={18} />}
                >
                  Register
                </Button>
              </VStack>
            </form>

            <VStack mt="6" spacing="6">
              <Divider />
              <Text color="gray.500">
                Already have an account?
              </Text>
              <Button
                variant="outline"
                width="full"
                onClick={() => navigate('/login')}
              >
                Sign in
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default RegisterForm;