import { Box, VStack, Text, SimpleGrid, Flex, Badge, useColorModeValue } from '@chakra-ui/react';
import { categories } from '../data/categories';

export const CategoryScreen = ({ onSelectCategory, categoryProgress }) => {
  // Color mode values
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('gray.50', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.700');
  const titleColor = useColorModeValue('gray.800', 'white');
  const nameColor = useColorModeValue('gray.800', 'white');
  const nameZhColor = useColorModeValue('gray.500', 'gray.400');
  const wordsColor = useColorModeValue('gray.500', 'gray.500');
  const progressBarBg = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      minH="100vh"
      bg={bgColor}
      p={4}
      pb="100px"
    >
      <VStack spacing={4} align="stretch">
        <Text
          fontSize="2xl"
          fontWeight="bold"
          color={titleColor}
          textAlign="center"
          mb={2}
        >
          Choose a Topic
        </Text>

        <SimpleGrid columns={2} spacing={3}>
          {categories.map((category) => {
            const progress = categoryProgress[category.id] || { total: 0, mastered: 0, learning: 0 };
            const progressPercent = progress.total > 0
              ? Math.round(((progress.mastered + progress.learning) / progress.total) * 100)
              : 0;

            return (
              <Box
                key={category.id}
                bg={cardBg}
                borderRadius="xl"
                p={4}
                cursor="pointer"
                onClick={() => onSelectCategory(category.id)}
                _hover={{ bg: cardHoverBg, transform: 'scale(1.02)' }}
                _active={{ transform: 'scale(0.98)' }}
                transition="all 0.2s"
                border="1px solid"
                borderColor={cardBorderColor}
              >
                <VStack spacing={2} align="start">
                  <Text fontSize="2xl">{category.icon}</Text>
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={nameColor}
                    noOfLines={1}
                  >
                    {category.name}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={nameZhColor}
                    noOfLines={1}
                  >
                    {category.nameZh}
                  </Text>

                  {/* Progress bar */}
                  <Box w="100%" mt={1}>
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="xs" color={wordsColor}>
                        {progress.total} words
                      </Text>
                      <Text fontSize="xs" color="green.400">
                        {progressPercent}%
                      </Text>
                    </Flex>
                    <Box
                      w="100%"
                      h="4px"
                      bg={progressBarBg}
                      borderRadius="full"
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        w={`${progressPercent}%`}
                        bg="green.500"
                        borderRadius="full"
                        transition="width 0.3s"
                      />
                    </Box>
                  </Box>

                  {progress.mastered > 0 && (
                    <Badge colorScheme="green" fontSize="xs">
                      {progress.mastered} mastered
                    </Badge>
                  )}
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};
