import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../context/AuthContext';
import { Box, Alert as ChakraAlert, AlertIcon } from '@chakra-ui/react';
import { Navigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const message = location.state?.message;

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <Box>
      {message && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          zIndex="50"
          p="4"
        >
          <ChakraAlert status="success" variant="subtle" borderRadius="md">
            <AlertIcon />
            {message}
          </ChakraAlert>
        </Box>
      )}
      <LoginForm />
    </Box>
  );
};

export default LoginPage;