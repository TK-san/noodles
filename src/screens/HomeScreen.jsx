import {
  VStack,
  Heading,
  Text,
  Button,
  Container,
  Box,
  IconButton,
  useColorMode,
  useColorModeValue,
  HStack
} from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Home/Welcome screen
 */
export const HomeScreen = ({ onStartLearning, stats }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const headingColor = useColorModeValue('brand.600', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');

  return (
    <Container maxW="md" h="100vh" display="flex" alignItems="center" position="relative">
      {/* Theme toggle button */}
      <Box position="absolute" top={4} right={4}>
        <IconButton
          aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
          icon={colorMode === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          onClick={toggleColorMode}
          variant="ghost"
          size="lg"
          borderRadius="full"
        />
      </Box>

      <VStack spacing={8} w="100%" textAlign="center">
        <Box fontSize="6xl">🍜</Box>
        <Heading size="2xl" color={headingColor}>
          Noodles
        </Heading>
        <Text fontSize="lg" color={textColor}>
          Learn Chinese vocabulary, one word at a time
        </Text>

        <VStack spacing={4} w="100%" mt={8}>
          <Text fontSize="md" color={subTextColor}>
            {stats.total} words ready to learn
          </Text>
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

        {/* Theme mode indicator */}
        <HStack spacing={2} mt={4}>
          <Text fontSize="sm" color={subTextColor}>
            {colorMode === 'light' ? 'Light' : 'Dark'} Mode
          </Text>
        </HStack>
      </VStack>
    </Container>
  );
};
