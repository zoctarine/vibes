import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { Box, Flex, Text, IconButton, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Generate breadcrumb based on current location
  const generateBreadcrumb = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    if (pathParts.length === 0) {
      return [{ label: 'Projects', path: '/' }];
    }

    const breadcrumbs = [{ label: 'Projects', path: '/' }];
    
    // Add more breadcrumb items based on the path
    // This is a simplified version - in a real app, you'd use more context
    if (pathParts[0] === 'projects' && pathParts.length > 1) {
      breadcrumbs.push({ label: 'Project Details', path: `/projects/${pathParts[1]}` });
      
      if (pathParts[2] === 'documents' && pathParts.length > 3) {
        breadcrumbs.push({ 
          label: 'Document', 
          path: `/projects/${pathParts[1]}/documents/${pathParts[3]}` 
        });
      }
    } else if (pathParts[0] === 'documents') {
      breadcrumbs.push({ label: 'Recent Documents', path: '/documents' });
    } else if (pathParts[0] === 'api-keys') {
      breadcrumbs.push({ label: 'API Keys', path: '/api-keys' });
    } else if (pathParts[0] === 'profile') {
      breadcrumbs.push({ label: 'Profile', path: '/profile' });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumb();

  return (
    <Box as="header" display="flex" alignItems="center" justifyContent="space-between" h="16" px={{ base: 4, md: 6 }} bg="white" borderBottomWidth="1px">
      <Flex alignItems="center">
        <Breadcrumb spacing="1" separator={<ChevronRight size={16} color="gray.400" />}>
            {breadcrumbs.map((item, index) => (
              <BreadcrumbItem key={item.path} isCurrentPage={index === breadcrumbs.length - 1}>
                <BreadcrumbLink
                  href={item.path}
                  fontSize="sm"
                  fontWeight="medium"
                  color={index === breadcrumbs.length - 1 ? 'blue.600' : 'gray.500'}
                  _hover={{ color: 'gray.700' }}
                >
                    {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
            ))}
        </Breadcrumb>
      </Flex>
      <Flex alignItems="center">
        <Text fontSize="sm" mr="4" color="gray.600">
          {user?.email}
        </Text>
        <IconButton
          icon={<LogOut size={20} />}
          onClick={handleSignOut}
          aria-label="Sign out"
          variant="ghost"
          rounded="full"
          color="gray.500"
          _hover={{ color: 'gray.700', bg: 'gray.100' }}
        />
      </Flex>
    </Box>
  );
};

export default Header;