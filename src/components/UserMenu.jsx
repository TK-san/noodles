import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Text,
  HStack,
  Icon,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUser, FiLogOut, FiCloud, FiCloudOff } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

export const UserMenu = ({ onSignIn }) => {
  const { user, isOfflineMode, signOut, setIsOfflineMode } = useAuth();
  const toast = useToast();

  const menuBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Sign out failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Signed out',
        status: 'info',
        duration: 2000,
      });
    }
  };

  const handleSignIn = () => {
    setIsOfflineMode(false);
    if (onSignIn) onSignIn();
  };

  if (isOfflineMode) {
    return (
      <Menu>
        <MenuButton
          as={IconButton}
          icon={<FiCloudOff size={20} />}
          variant="ghost"
          size="lg"
          borderRadius="full"
          aria-label="Offline mode"
        />
        <MenuList bg={menuBg}>
          <MenuItem isDisabled>
            <HStack>
              <Icon as={FiCloudOff} />
              <Text>Offline Mode</Text>
            </HStack>
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={handleSignIn}>
            <HStack>
              <Icon as={FiUser} />
              <Text>Sign in to sync</Text>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>
    );
  }

  if (!user) {
    return (
      <IconButton
        icon={<FiUser size={20} />}
        variant="ghost"
        size="lg"
        borderRadius="full"
        aria-label="Sign in"
        onClick={handleSignIn}
      />
    );
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        icon={<FiCloud size={20} />}
        variant="ghost"
        size="lg"
        borderRadius="full"
        aria-label="User menu"
        color="green.500"
      />
      <MenuList bg={menuBg}>
        <MenuItem isDisabled>
          <Text fontSize="sm" color={textColor} noOfLines={1}>
            {user.email}
          </Text>
        </MenuItem>
        <MenuItem isDisabled>
          <HStack>
            <Icon as={FiCloud} color="green.500" />
            <Text color="green.500">Synced to cloud</Text>
          </HStack>
        </MenuItem>
        <MenuDivider />
        <MenuItem onClick={handleSignOut}>
          <HStack>
            <Icon as={FiLogOut} />
            <Text>Sign out</Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};
