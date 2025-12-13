import {
  VStack,
  Heading,
  Text,
  Button,
  Container,
  Box,
  useColorModeValue
} from '@chakra-ui/react';

/**
 * Home/Welcome screen
 */
export const HomeScreen = ({ onStartLearning }) => {
  const headingColor = useColorModeValue('brand.600', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Container maxW="md" h="100vh" display="flex" alignItems="center">
      <VStack spacing={8} w="100%" textAlign="center">
        <Box fontSize="6xl">🍜</Box>
        <Heading size="2xl" color={headingColor}>
          Noodles
        </Heading>
        <Text fontSize="lg" color={textColor}>
          Learn Chinese vocabulary, one word at a time
        </Text>

        <VStack spacing={4} w="100%" mt={8}>
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
