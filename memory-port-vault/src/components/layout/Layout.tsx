import { Navigate, Outlet } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <Flex h="100vh" bg="gray.50">
      <Sidebar />
      <Box flex="1" display="flex" flexDir="column" overflow="hidden">
        <Header />
        <Box as="main" flex="1" overflowY="auto" p={{ base: 4, md: 6 }}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default Layout;