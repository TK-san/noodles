import {
  VStack,
  Heading,
  Text,
  Button,
  Container,
  Box,
  IconButton,
  HStack,
  useColorMode,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { UserMenu } from '../components/UserMenu';
import { LevelCard } from '../components/LevelBadge';

/**
 * Home/Welcome screen
 */
export const HomeScreen = ({ onStartLearning }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const headingColor = useColorModeValue('brand.600', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Container maxW="md" h="100vh" display="flex" alignItems="center" position="relative">
      {/* Top bar with user menu and theme toggle */}
      <HStack position="absolute" top={4} right={4} spacing={1}>
        <UserMenu />
        <IconButton
          aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          icon={colorMode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          onClick={toggleColorMode}
          variant="ghost"
          size="lg"
          borderRadius="full"
        />
      </HStack>

      <VStack spacing={6} w="100%" textAlign="center">
        <Box fontSize="6xl">🍜</Box>
        <Heading size="2xl" color={headingColor}>
          Noodles
        </Heading>
        <Text fontSize="lg" color={textColor}>
          Learn Chinese vocabulary, one word at a time
        </Text>

        {/* Level progress card */}
        <LevelCard showDetails={true} />

        <VStack spacing={4} w="100%" mt={2}>
          <Button
            colorScheme="brand"
            size="lg"
            w="100%"
            maxW="300px"
            onClick={onStartLearning}
          >
            Start Learning
          </Button>
        </VStack>
      </VStack>
    </Container>
  );
};
