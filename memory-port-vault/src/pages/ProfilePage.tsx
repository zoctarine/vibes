import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/profile';
import { User } from '../types';
import { Box, VStack, Heading, Text, Flex, Icon, Avatar } from '@chakra-ui/react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import { User as UserIcon, Save, LogOut } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const profileData = await getProfile();
      setProfile(profileData);
      if (profileData) {
        setFullName(profileData.fullName || '');
        setAvatarUrl(profileData.avatarUrl || '');
      }
    } catch (err: any) {
      // Don't show error for new profiles
      if (err.code !== 'PGRST116') {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updatedProfile = await updateProfile({
        fullName: fullName || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
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
    );
  }

  return (
    <VStack spacing="6" align="stretch">
      <Heading size="lg" color="gray.900">Profile</Heading>

      {error && (
        <Alert
          variant="error"
          isDismissable
          onDismiss={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          variant="success"
          isDismissable
          onDismiss={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      <Card borderWidth="1px" borderColor="gray.200">
        <CardHeader 
          title="Personal Information" 
          description="Update your personal details"
        />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <VStack spacing="6" align="stretch">
              <Flex justify="center">
                <Box position="relative">
                  {avatarUrl ? (
                    <Avatar
                      size="2xl"
                      src={avatarUrl}
                      name={fullName || user?.email}
                    />
                  ) : (
                    <Avatar
                      size="2xl"
                      icon={<Icon as={UserIcon} boxSize="8" color="gray.400" />}
                      bg="gray.100"
                      name={fullName || user?.email}
                    />
                  )}
                </Box>
              </Flex>
            
              <Box>
                <Input
                  label="Email"
                  value={user?.email || ''}
                  isDisabled
                  helpText="Email cannot be changed"
                />
              </Box>
            
              <Box>
                <Input
                  label="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </Box>
            
              <Box>
                <Input
                  label="Avatar URL"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  helpText="Enter a URL for your profile picture"
                />
              </Box>
            
              <Box pt="4">
              <Button
                type="submit"
                variant="primary"
                isLoading={isSaving}
                leftIcon={<Save size={18} />}
                width={{ base: 'full', sm: 'auto' }}
              >
                Save Changes
              </Button>
              </Box>
            </VStack>
          </form>
        </CardContent>
      </Card>

      <Card borderWidth="1px" borderColor="gray.200">
        <CardHeader 
          title="Account" 
          description="Manage your account"
        />
        <CardContent>
          <VStack spacing="4" align="stretch">
            <Text fontSize="sm" color="gray.600">
              Sign out of your account to end your current session.
            </Text>
            <Box>
              <Button
                variant="danger"
                onClick={() => signOut()}
                leftIcon={<LogOut size={18} />}
                width={{ base: 'full', sm: 'auto' }}
              >
                Sign Out
              </Button>
            </Box>
          </VStack>
        </CardContent>
      </Card>
    </VStack>
  );
};

export default ProfilePage;