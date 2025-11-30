import { 
  VStack, 
  Container, 
  Heading, 
  Box, 
  Text, 
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress
} from '@chakra-ui/react';

/**
 * Progress/Statistics screen
 */
export const ProgressScreen = ({ stats }) => {
  const masteredPercentage = stats.total > 0 
    ? Math.round((stats.mastered / stats.total) * 100)
    : 0;

  return (
    <Container maxW="md" py={8} pb="100px">
      <VStack spacing={8} align="stretch">
        <Heading size="lg" color="gray.700">
          Your Progress
        </Heading>

        {/* Overall progress card */}
        <Box bg="white" p={6} borderRadius="xl" boxShadow="md">
          <VStack spacing={4}>
            <Text fontSize="5xl">{masteredPercentage}%</Text>
            <Text color="gray.600">Words Mastered</Text>
            <Progress 
              value={masteredPercentage} 
              w="100%" 
              colorScheme="brand" 
              borderRadius="full"
              size="lg"
            />
          </VStack>
        </Box>

        {/* Stats grid */}
        <SimpleGrid columns={2} spacing={4}>
          <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Total Words</StatLabel>
              <StatNumber>{stats.total}</StatNumber>
              <StatHelpText>In library</StatHelpText>
            </Stat>
          </Box>

          <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Mastered</StatLabel>
              <StatNumber color="green.500">{stats.mastered}</StatNumber>
              <StatHelpText>✅ Complete</StatHelpText>
            </Stat>
          </Box>

          <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Learning</StatLabel>
              <StatNumber color="blue.500">{stats.learning}</StatNumber>
              <StatHelpText>📚 In progress</StatHelpText>
            </Stat>
          </Box>

          <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
            <Stat>
              <StatLabel>Not Seen</StatLabel>
              <StatNumber color="gray.400">{stats.notSeen}</StatNumber>
              <StatHelpText>🆕 New</StatHelpText>
            </Stat>
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
};