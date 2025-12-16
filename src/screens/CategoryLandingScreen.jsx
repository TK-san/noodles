import {
  VStack,
  Container,
  Heading,
  Box,
  Text,
  SimpleGrid,
  Badge,
  HStack,
  IconButton,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlay, FiRefreshCw, FiCheck } from 'react-icons/fi';

/**
 * Category landing screen - shown when a category is selected
 * Shows progress and lets user choose study mode
 */
export const CategoryLandingScreen = ({
  category,
  stats,
  onStudyAll,
  onStudyLearning,
  onStudyMastered,
  onBack,
  emptyMessage
}) => {
  // Color mode values
  const headingColor = useColorModeValue('gray.800', 'white');
  const cardBg = useColorModeValue('white', 'gray.800');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const learningCount = stats?.learning || 0;
  const masteredCount = stats?.mastered || 0;
  const notSeenCount = stats?.notSeen || 0;
  const totalCount = stats?.total || 0;

  return (
    <Container maxW="md" py={8} pb="100px">
      <VStack spacing={6} align="stretch">
        {/* Header with back button */}
        <HStack spacing={3}>
          <IconButton
            icon={<FiArrowLeft size={20} />}
            onClick={onBack}
            variant="ghost"
            aria-label="Back to categories"
            size="sm"
          />
          <VStack spacing={0} align="start" flex={1}>
            <HStack>
              <Text fontSize="2xl">{category?.icon}</Text>
              <Heading size="lg" color={headingColor}>
                {category?.name}
              </Heading>
            </HStack>
            <Text color={subtextColor} fontSize="sm">
              {totalCount} words total
            </Text>
          </VStack>
        </HStack>

        {/* Progress Stats */}
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
                {masteredCount}
              </Text>
              <Text fontSize="xs" color={subtextColor}>Mastered</Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {learningCount}
              </Text>
              <Text fontSize="xs" color={subtextColor}>Learning</Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="2xl" fontWeight="bold" color={subtextColor}>
                {notSeenCount}
              </Text>
              <Text fontSize="xs" color={subtextColor}>Not Seen</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Empty message alert */}
        {emptyMessage && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            {emptyMessage}
          </Alert>
        )}

        {/* Study Mode Cards */}
        <SimpleGrid columns={1} spacing={4}>
          {/* Study All Words */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
            cursor="pointer"
            onClick={onStudyAll}
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
                <FiPlay size={24} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                    Study All
                  </Text>
                  <Badge colorScheme="purple" fontSize="xs">
                    {totalCount} words
                  </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                  Go through all words in this category
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Study Learning Words */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
            cursor={learningCount > 0 ? 'pointer' : 'not-allowed'}
            onClick={learningCount > 0 ? onStudyLearning : undefined}
            opacity={learningCount > 0 ? 1 : 0.6}
            _hover={learningCount > 0 ? { transform: 'translateY(-2px)', boxShadow: 'lg' } : {}}
            transition="all 0.2s"
          >
            <HStack spacing={4}>
              <Box
                bg={learningCount > 0 ? 'blue.500' : 'gray.400'}
                p={3}
                borderRadius="lg"
                color="white"
              >
                <FiRefreshCw size={24} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                    Practice Learning
                  </Text>
                  <Badge colorScheme={learningCount > 0 ? 'blue' : 'gray'} fontSize="xs">
                    {learningCount} words
                  </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                  {learningCount > 0
                    ? 'Focus on words you\'re still learning'
                    : 'Mark words as "Learning" to practice them here'
                  }
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Review Mastered Words */}
          <Box
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="md"
            border="1px solid"
            borderColor={borderColor}
            cursor={masteredCount > 0 ? 'pointer' : 'not-allowed'}
            onClick={masteredCount > 0 ? onStudyMastered : undefined}
            opacity={masteredCount > 0 ? 1 : 0.6}
            _hover={masteredCount > 0 ? { transform: 'translateY(-2px)', boxShadow: 'lg' } : {}}
            transition="all 0.2s"
          >
            <HStack spacing={4}>
              <Box
                bg={masteredCount > 0 ? 'green.500' : 'gray.400'}
                p={3}
                borderRadius="lg"
                color="white"
              >
                <FiCheck size={24} />
              </Box>
              <VStack align="start" spacing={1} flex={1}>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg" color={headingColor}>
                    Review Mastered
                  </Text>
                  <Badge colorScheme={masteredCount > 0 ? 'green' : 'gray'} fontSize="xs">
                    {masteredCount} words
                  </Badge>
                </HStack>
                <Text fontSize="sm" color={subtextColor}>
                  {masteredCount > 0
                    ? 'Review words you\'ve already mastered'
                    : 'Master some words to review them here'
                  }
                </Text>
              </VStack>
            </HStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Container>
  );
};
