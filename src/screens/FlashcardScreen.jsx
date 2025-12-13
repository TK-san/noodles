import {
  VStack,
  Container,
  HStack,
  IconButton,
  Text,
  Button,
  useToast,
  Box,
  useColorModeValue
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import { useState, useCallback } from 'react';
import { Flashcard } from '../components/Flashcard';
import { ProgressBar } from '../components/ProgressBar';
import { useFlashcard } from '../hooks/useFlashcard';
import { useSwipe } from '../hooks/useSwipe';

const FLIP_DURATION = 300;

/**
 * Main flashcard learning screen
 * Optimized for iPhone 12 Pro (390x844)
 */
export const FlashcardScreen = ({ words, stats, onUpdateStatus, categoryName, categoryIcon, onBackToCategories }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isFlipped, flipCard, resetFlip } = useFlashcard();
  const toast = useToast();

  // Color mode values
  const categoryTextColor = useColorModeValue('gray.800', 'white');
  const counterColor = useColorModeValue('gray.500', 'gray.400');

  const currentWord = words[currentIndex];

  const navigateToCard = useCallback((newIndex) => {
    if (isTransitioning) return;

    if (isFlipped) {
      setIsTransitioning(true);
      resetFlip();
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsTransitioning(false);
      }, FLIP_DURATION);
    } else {
      setCurrentIndex(newIndex);
    }
  }, [isFlipped, isTransitioning, resetFlip]);

  const goToNext = useCallback(() => {
    if (currentIndex < words.length - 1) {
      navigateToCard(currentIndex + 1);
    } else {
      toast({
        title: 'Great job!',
        description: "You've reviewed all words!",
        status: 'success',
        duration: 2000,
      });
    }
  }, [currentIndex, words.length, navigateToCard, toast]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      navigateToCard(currentIndex - 1);
    }
  }, [currentIndex, navigateToCard]);

  const swipeHandlers = useSwipe(goToNext, goToPrevious);

  const playAudio = () => {
    toast({
      title: 'Audio coming soon!',
      description: `Pronunciation for "${currentWord.chinese}"`,
      status: 'info',
      duration: 1500,
    });
  };

  const handleMarkLearning = () => {
    onUpdateStatus(currentWord.id, 'learning');
    toast({
      title: 'Marked as learning',
      status: 'info',
      duration: 1000,
    });
    goToNext();
  };

  const handleMarkMastered = () => {
    onUpdateStatus(currentWord.id, 'mastered');
    toast({
      title: 'Mastered!',
      status: 'success',
      duration: 1000,
    });
    goToNext();
  };

  return (
    <Container
      maxW="390px"
      h="100vh"
      px={4}
      py={4}
      pb="90px"
      display="flex"
      flexDirection="column"
    >
      <VStack spacing={3} flex={1} w="100%">
        {/* Category header */}
        {categoryName && (
          <HStack w="100%" justify="center" spacing={2}>
            <Text fontSize="lg">{categoryIcon}</Text>
            <Text fontSize="md" fontWeight="bold" color={categoryTextColor}>
              {categoryName}
            </Text>
          </HStack>
        )}

        {/* Progress bar - compact */}
        <Box w="100%">
          <ProgressBar stats={stats} />
        </Box>

        {/* Card counter */}
        <Text fontSize="xs" color={counterColor}>
          Card {currentIndex + 1} of {words.length}
        </Text>

        {/* Flashcard with swipe support */}
        <Box
          {...swipeHandlers}
          w="100%"
          flex={1}
          display="flex"
          alignItems="center"
          justifyContent="center"
          minH="0"
          style={{
            pointerEvents: isTransitioning ? 'none' : 'auto',
            opacity: isTransitioning ? 0.9 : 1,
            transition: 'opacity 0.15s ease'
          }}
        >
          <Flashcard
            word={currentWord}
            isFlipped={isFlipped}
            onFlip={flipCard}
            onPlayAudio={playAudio}
          />
        </Box>

        {/* Navigation buttons */}
        <HStack spacing={6} w="100%" justify="center">
          <IconButton
            icon={<FiChevronLeft size={20} />}
            onClick={goToPrevious}
            isDisabled={currentIndex === 0 || isTransitioning}
            variant="outline"
            size="md"
            borderRadius="full"
            aria-label="Previous card"
          />
          <IconButton
            icon={<FiChevronRight size={20} />}
            onClick={goToNext}
            isDisabled={currentIndex === words.length - 1 || isTransitioning}
            variant="outline"
            size="md"
            borderRadius="full"
            aria-label="Next card"
          />
        </HStack>

        {/* Quick action buttons - compact */}
        <HStack spacing={3} w="100%">
          <Button
            leftIcon={<FiX size={16} />}
            flex={1}
            variant="outline"
            colorScheme="gray"
            size="md"
            onClick={handleMarkLearning}
            isDisabled={isTransitioning}
          >
            Learning
          </Button>
          <Button
            leftIcon={<FiCheck size={16} />}
            flex={1}
            colorScheme="red"
            size="md"
            onClick={handleMarkMastered}
            isDisabled={isTransitioning}
          >
            Mastered
          </Button>
        </HStack>
      </VStack>
    </Container>
  );
};
