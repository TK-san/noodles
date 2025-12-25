import { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  Text,
  Box,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const LEVEL_INFO = {
  1: { name: 'Beginner', icon: '🌱', message: 'Your journey begins!' },
  2: { name: 'Elementary', icon: '🌿', message: 'Growing stronger!' },
  3: { name: 'Intermediate', icon: '🌳', message: 'Extended vocabulary unlocked!' },
  4: { name: 'Advanced', icon: '🌲', message: 'Becoming fluent!' },
  5: { name: 'Expert', icon: '🏆', message: 'Master of vocabulary!' },
};

const LEVEL_COLORS = {
  1: 'gray',
  2: 'blue',
  3: 'green',
  4: 'purple',
  5: 'yellow',
};

// Animations
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
  50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
`;

const confetti = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

const ConfettiPiece = ({ color, left, delay }) => (
  <Box
    position="absolute"
    top="-20px"
    left={left}
    w="10px"
    h="10px"
    bg={color}
    borderRadius="sm"
    animation={`${confetti} 3s ease-out ${delay}s forwards`}
  />
);

export const LevelUpModal = ({ isOpen, onClose, newLevel, previousLevel }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const levelInfo = LEVEL_INFO[newLevel] || LEVEL_INFO[1];
  const levelColor = LEVEL_COLORS[newLevel] || 'gray';

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const confettiColors = ['red.400', 'blue.400', 'green.400', 'yellow.400', 'purple.400', 'pink.400'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent
        bg={bgColor}
        mx={4}
        overflow="hidden"
        position="relative"
      >
        {/* Confetti */}
        {showConfetti && (
          <Box position="absolute" top={0} left={0} right={0} overflow="hidden" h="100%" pointerEvents="none">
            {[...Array(20)].map((_, i) => (
              <ConfettiPiece
                key={i}
                color={confettiColors[i % confettiColors.length]}
                left={`${(i * 5) % 100}%`}
                delay={i * 0.1}
              />
            ))}
          </Box>
        )}

        <ModalBody py={8}>
          <VStack spacing={6}>
            {/* Level up text */}
            <Text
              fontSize="sm"
              fontWeight="bold"
              textTransform="uppercase"
              letterSpacing="wider"
              color={`${levelColor}.500`}
            >
              Level Up!
            </Text>

            {/* Level icon with animation */}
            <Box
              fontSize="6xl"
              animation={`${bounce} 1s ease-in-out, ${glow} 2s ease-in-out infinite`}
              borderRadius="full"
              p={4}
            >
              {levelInfo.icon}
            </Box>

            {/* Level number */}
            <VStack spacing={1}>
              <Text fontSize="4xl" fontWeight="bold" color={`${levelColor}.500`}>
                Level {newLevel}
              </Text>
              <Text fontSize="xl" fontWeight="semibold">
                {levelInfo.name}
              </Text>
            </VStack>

            {/* Message */}
            <Text textAlign="center" color={textColor} px={4}>
              {levelInfo.message}
            </Text>

            {/* Special unlock message for level 3 */}
            {newLevel === 3 && (
              <Box
                bg={useColorModeValue('purple.50', 'purple.900')}
                p={4}
                borderRadius="lg"
                textAlign="center"
              >
                <Text fontSize="sm" color={useColorModeValue('purple.700', 'purple.200')}>
                  You've unlocked extended vocabulary categories with thousands more words to learn!
                </Text>
              </Box>
            )}

            {/* Continue button */}
            <Button
              colorScheme={levelColor}
              size="lg"
              onClick={onClose}
              w="full"
              maxW="200px"
            >
              Continue
            </Button>

            {/* Progress indicator */}
            <Text fontSize="xs" color={textColor}>
              {previousLevel} → {newLevel}
            </Text>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
