import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Vault, Key, User, Menu, X, FileText } from 'lucide-react';
import { Box, Flex, Heading, IconButton, VStack, Link, useBreakpointValue } from '@chakra-ui/react';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const toggleSidebar = () => setIsOpen(!isOpen);

  const links = [
    { to: '/', icon: <LayoutGrid size={20} />, label: 'Projects' },
    { to: '/documents', icon: <FileText size={20} />, label: 'Recent Documents' },
    { to: '/api-keys', icon: <Key size={20} />, label: 'API Keys' },
    { to: '/profile', icon: <User size={20} />, label: 'Profile' },
  ];

  return (
    <>
      <Box
        position={{ base: 'fixed', md: 'static' }}
        left="0"
        top="0"
        zIndex="30"
        h="full"
        w="64"
        transform={{ base: isOpen ? 'translateX(0)' : 'translateX(-100%)', md: 'none' }}
        transition="transform 0.3s"
        bg="white"
        boxShadow={{ base: 'lg', md: 'none' }}
      >
        <Flex h="16" px="4" borderBottomWidth="1px" alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap="2">
            <Box as={Vault} h="8" w="8" color="blue.600" />
            <Heading size="lg" color="gray.900">MemPortVault</Heading>
          </Flex>
          {isMobile && (
            <IconButton
              icon={<X size={20} />}
              onClick={toggleSidebar}
              aria-label="Close sidebar"
              variant="ghost"
              color="gray.500"
              _hover={{ color: 'gray.600' }}
            />
          )}
        </Flex>
        <VStack as="nav" p="4" spacing="1" align="stretch">
          {links.map((link) => (
            <Link
              as={NavLink}
              key={link.to}
              to={link.to}
              display="flex"
              alignItems="center"
              px="3"
              py="2"
              rounded="md"
              fontSize="sm"
              fontWeight="medium"
              color="gray.700"
              _activeLink={{
                color: 'blue.700',
                bg: 'blue.50'
              }}
              _hover={{
                color: 'blue.700',
                bg: 'blue.50'
              }}
              transition="colors 0.2s"
              end={link.to === '/'}
            >
              <Box mr="3">{link.icon}</Box>
              {link.label}
            </Link>
          ))}
        </VStack>
      </Box>
      {isMobile && (
        <IconButton
          icon={<Menu size={24} />}
          onClick={toggleSidebar}
          position="fixed"
          bottom="4"
          left="4"
          zIndex="40"
          colorScheme="blue"
          rounded="full"
          boxShadow="lg"
          aria-label="Open menu"
        />
      )}
    </>
  );
};

export default Sidebar;