import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { useUserLevel } from '../hooks/useUserLevel';

const LEVEL_COLORS = {
  1: { bg: 'gray.500', light: 'gray.100' },
  2: { bg: 'blue.500', light: 'blue.100' },
  3: { bg: 'green.500', light: 'green.100' },
  4: { bg: 'purple.500', light: 'purple.100' },
  5: { bg: 'yellow.500', light: 'yellow.100' },
};

const LEVEL_ICONS = {
  1: '🌱',
  2: '🌿',
  3: '🌳',
  4: '🌲',
  5: '🏆',
};

/**
 * Compact level badge for header/navigation
 */
export const LevelBadgeCompact = () => {
  const { level, levelName, totalMastered, progressToNextLevel, isLoading } = useUserLevel();
  const progress = progressToNextLevel();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (isLoading) return null;

  return (
    <Tooltip
      label={`${levelName} - ${totalMastered} words mastered${level < 5 ? ` (${progress.remaining} to next level)` : ''}`}
      placement="bottom"
    >
      <HStack
        bg={bgColor}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="full"
        px={3}
        py={1}
        spacing={2}
        cursor="default"
      >
        <Text fontSize="sm">{LEVEL_ICONS[level]}</Text>
        <Text fontSize="sm" fontWeight="bold" color={LEVEL_COLORS[level].bg}>
          Lv.{level}
        </Text>
      </HStack>
    </Tooltip>
  );
};

/**
 * Full level display with progress bar
 */
export const LevelCard = ({ showDetails = true }) => {
  const {
    level,
    levelName,
    totalMastered,
    streak,
    progressToNextLevel,
    hasExtendedAccess,
    isLoading,
  } = useUserLevel();

  const progress = progressToNextLevel();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const progressBg = useColorModeValue('gray.100', 'gray.700');
  const levelColor = LEVEL_COLORS[level]?.bg || 'gray.500';

  if (isLoading) return null;

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={4}
      w="100%"
      maxW="300px"
    >
      <VStack spacing={3} align="stretch">
        {/* Level header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="2xl">{LEVEL_ICONS[level]}</Text>
            <VStack align="start" spacing={0}>
              <Text fontWeight="bold" color={levelColor}>
                Level {level}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {levelName}
              </Text>
            </VStack>
          </HStack>

          {streak > 0 && (
            <HStack spacing={1}>
              <Text fontSize="lg">🔥</Text>
              <Text fontSize="sm" fontWeight="bold">
                {streak}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Progress bar */}
        {level < 5 && (
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color={textColor}>
                Progress to Level {level + 1}
              </Text>
              <Text fontSize="xs" color={textColor}>
                {progress.current}/{progress.target}
              </Text>
            </HStack>
            <Progress
              value={progress.percent}
              size="sm"
              colorScheme={levelColor.split('.')[0]}
              borderRadius="full"
              bg={progressBg}
            />
          </Box>
        )}

        {level >= 5 && (
          <Text fontSize="sm" color={levelColor} textAlign="center">
            Maximum level reached! 🎉
          </Text>
        )}

        {/* Stats */}
        {showDetails && (
          <HStack justify="space-around" pt={2}>
            <VStack spacing={0}>
              <Text fontSize="lg" fontWeight="bold">
                {totalMastered}
              </Text>
              <Text fontSize="xs" color={textColor}>
                Mastered
              </Text>
            </VStack>

            {hasExtendedAccess ? (
              <VStack spacing={0}>
                <Text fontSize="lg">✅</Text>
                <Text fontSize="xs" color="green.500">
                  Extended Unlocked
                </Text>
              </VStack>
            ) : (
              <VStack spacing={0}>
                <Text fontSize="lg">🔒</Text>
                <Text fontSize="xs" color={textColor}>
                  Unlock at Lv.3
                </Text>
              </VStack>
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  );
};
