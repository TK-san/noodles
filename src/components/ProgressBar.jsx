import { Box, Progress, Text, HStack, VStack } from '@chakra-ui/react';

/**
 * Progress visualization component
 * Shows learning progress as a percentage and stats
 */
export const ProgressBar = ({ stats }) => {
  const progressPercentage = stats.total > 0 
    ? Math.round(((stats.learning + stats.mastered) / stats.total) * 100)
    : 0;

  return (
    <VStack w="100%" spacing={3} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium" color="gray.600">
          Learning Progress
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="brand.600">
          {stats.learning + stats.mastered} / {stats.total}
        </Text>
      </HStack>
      
      <Progress 
        value={progressPercentage} 
        colorScheme="brand" 
        borderRadius="full"
        size="lg"
      />
      
      <HStack spacing={4} fontSize="xs" color="gray.500" justify="center">
        <Text>🆕 Not seen: {stats.notSeen}</Text>
        <Text>📚 Learning: {stats.learning}</Text>
        <Text>✅ Mastered: {stats.mastered}</Text>
      </HStack>
    </VStack>
  );
};