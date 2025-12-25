import { Box, VStack, Text, SimpleGrid, Flex, Badge, HStack, Icon, useColorModeValue } from '@chakra-ui/react';
import { FiLock } from 'react-icons/fi';
import { categories } from '../data/categories';
import { useUserLevel } from '../hooks/useUserLevel';

export const CategoryScreen = ({ onSelectCategory, categoryProgress, extendedCategories = [] }) => {
  const { level, hasExtendedAccess } = useUserLevel();
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
  const lockedBg = useColorModeValue('gray.100', 'gray.800');
  const lockedBorder = useColorModeValue('gray.300', 'gray.600');

  // Combine static and extended categories
  const allCategories = [
    ...categories.map(c => ({ ...c, isExtended: false })),
    ...extendedCategories.map(c => ({ ...c, isExtended: true })),
  ];

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
          {allCategories.map((category) => {
            const progress = categoryProgress[category.id] || { total: 0, mastered: 0, learning: 0 };
            const progressPercent = progress.total > 0
              ? Math.round((progress.mastered / progress.total) * 100)
              : 0;

            // Check if category is locked (extended categories require level 3+)
            const isLocked = category.isExtended && !hasExtendedAccess;

            return (
              <Box
                key={category.id}
                bg={isLocked ? lockedBg : cardBg}
                borderRadius="xl"
                p={4}
                cursor={isLocked ? 'not-allowed' : 'pointer'}
                onClick={() => !isLocked && onSelectCategory(category.id)}
                _hover={isLocked ? {} : { bg: cardHoverBg, transform: 'scale(1.02)' }}
                _active={isLocked ? {} : { transform: 'scale(0.98)' }}
                transition="all 0.2s"
                border="1px solid"
                borderColor={isLocked ? lockedBorder : cardBorderColor}
                opacity={isLocked ? 0.7 : 1}
                position="relative"
              >
                {/* Lock overlay for extended categories */}
                {isLocked && (
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    bg="gray.500"
                    borderRadius="full"
                    p={1}
                  >
                    <Icon as={FiLock} color="white" boxSize={3} />
                  </Box>
                )}

                <VStack spacing={2} align="start">
                  <HStack>
                    <Text fontSize="2xl">{category.icon}</Text>
                    {category.isExtended && !isLocked && (
                      <Badge colorScheme="purple" fontSize="xs">
                        Extended
                      </Badge>
                    )}
                  </HStack>
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

                  {/* Locked message or progress bar */}
                  {isLocked ? (
                    <Text fontSize="xs" color="gray.500">
                      Unlock at Level 3
                    </Text>
                  ) : (
                    <>
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
                    </>
                  )}
                </VStack>
              </Box>
            );
          })}
        </SimpleGrid>

        {/* Unlock hint for users below level 3 */}
        {!hasExtendedAccess && extendedCategories.length > 0 && (
          <Box
            textAlign="center"
            py={4}
            px={6}
            bg={useColorModeValue('purple.50', 'purple.900')}
            borderRadius="lg"
            mt={4}
          >
            <Text fontSize="sm" color={useColorModeValue('purple.700', 'purple.200')}>
              Reach Level 3 to unlock {extendedCategories.length} extended categories with 1000s more words!
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
