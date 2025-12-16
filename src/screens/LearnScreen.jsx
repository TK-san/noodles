import {
  VStack,
  Container,
  Heading,
  Box,
  Text,
  SimpleGrid,
  Badge,
  HStack,
  useColorModeValue
} from '@chakra-ui/react';
import { FiShuffle, FiRepeat, FiZap } from 'react-icons/fi';

/**
 * Learn screen - shown when no category is selected
 * Offers Quick Quiz and Review Weak Words modes
 */
export const LearnScreen = ({
  onQuickQuiz,
  onReviewWeak,
  onDailyChallenge,
  totalStats
}) => {
  // Color mode values
  const headingColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Calculate weak words count (words in "learning" status)
  const weakWordsCount = totalStats?.learning || 0;

  return (
    <Container maxW="md" py={8} pb="100px">
      <VStack spacing={6} align="stretch">
        <VStack spacing={1}>
          <Heading size="lg" color={headingColor} textAlign="center">
            Learn
          </Heading>
          <Text color={subtextColor} textAlign="center">
            Choose a study mode
          </Text>
        </VStack>

        {/* Study Mode Cards */}
        <SimpleGrid columns={1} spacing={4}>
          {/* Quick Quiz */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
            cursor="pointer"
            onClick={onQuickQuiz}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            <HStack spacing={4}>
              <Box
                bg="purple.500"
                p={3}
                borderRadius="lg"
                color="white"
              >
                <FiShuffle size={24} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                    Quick Quiz
                  </Text>
                  <Badge colorScheme="purple" fontSize="xs">
                    10 words
                  </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                  Random words from all categories
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Review Weak Words */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
            cursor={weakWordsCount > 0 ? 'pointer' : 'not-allowed'}
            onClick={weakWordsCount > 0 ? onReviewWeak : undefined}
            opacity={weakWordsCount > 0 ? 1 : 0.6}
            _hover={weakWordsCount > 0 ? { transform: 'translateY(-2px)', boxShadow: 'lg' } : {}}
            transition="all 0.2s"
          >
            <HStack spacing={4}>
              <Box
                bg={weakWordsCount > 0 ? 'orange.500' : 'gray.400'}
                p={3}
                borderRadius="lg"
                color="white"
              >
                <FiRepeat size={24} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                    Review Weak Words
                  </Text>
                  <Badge colorScheme={weakWordsCount > 0 ? 'orange' : 'gray'} fontSize="xs">
                    {weakWordsCount} words
                  </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                  {weakWordsCount > 0
                    ? 'Practice words you\'re still learning'
                    : 'Mark words as "Learning" to review them here'
                  }
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Daily Challenge */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
            cursor="pointer"
            onClick={onDailyChallenge}
            _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
            transition="all 0.2s"
          >
            <HStack spacing={4}>
              <Box
                bg="green.500"
                p={3}
                borderRadius="lg"
                color="white"
              >
                <FiZap size={24} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                    Daily Challenge
                  </Text>
                  <Badge colorScheme="green" fontSize="xs">
                    20 words
                  </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                  Timed quiz to test your skills
                </Text>
              </VStack>
            </HStack>
          </Box>
        </SimpleGrid>

        {/* Stats Summary */}
        <Box
          bg={cardBg}
          p={4}
          borderRadius="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <HStack justify="space-around">
            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {totalStats?.mastered || 0}
              </Text>
              <Text fontSize="xs" color={subtextColor}>Mastered</Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {totalStats?.learning || 0}
              </Text>
              <Text fontSize="xs" color={subtextColor}>Learning</Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color={subtextColor}>
                {totalStats?.notSeen || 0}
              </Text>
              <Text fontSize="xs" color={subtextColor}>Not Seen</Text>
            </VStack>
          </HStack>
        </Box>
      </VStack>
    </Container>
  );
};
