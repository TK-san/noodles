import { VStack, Heading, Text, Button, Container, Box } from '@chakra-ui/react';

/**
 * Home/Welcome screen
 */
export const HomeScreen = ({ onStartLearning, stats }) => {
  return (
    <Container maxW="md" h="100vh" display="flex" alignItems="center">
      <VStack spacing={8} w="100%" textAlign="center">
        <Box fontSize="6xl">🍜</Box>
        <Heading size="2xl" color="brand.600">
          Noodles
        </Heading>
        <Text fontSize="lg" color="gray.600">
          Learn Chinese vocabulary, one word at a time
        </Text>
        
        <VStack spacing={4} w="100%" mt={8}>
          <Text fontSize="md" color="gray.500">
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
      </VStack>
    </Container>
  );
};