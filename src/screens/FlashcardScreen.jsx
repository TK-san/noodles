import {
  VStack,
  Container,
  HStack,
  IconButton,
  Text,
  Button,
  useToast,
  Box
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import { useState, useCallback } from 'react';
import { Flashcard } from '../components/Flashcard';
import { ProgressBar } from '../components/ProgressBar';
import { useFlashcard } from '../hooks/useFlashcard';
import { useSwipe } from '../hooks/useSwipe';

// Duration of flip animation in ms (must match CSS transition)
const FLIP_DURATION = 300;

/**
 * Main flashcard learning screen
 */
export const FlashcardScreen = ({ words, stats, onUpdateStatus }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isFlipped, flipCard, resetFlip } = useFlashcard();
  const toast = useToast();

  const currentWord = words[currentIndex];

  /**
   * Navigate to next/previous card with smooth transition
   * If card is flipped, flip it back first, then change card
   */
  const navigateToCard = useCallback((newIndex) => {
    if (isTransitioning) return;

    if (isFlipped) {
      // Card is flipped - flip back first, then navigate
      setIsTransitioning(true);
      resetFlip();

      // Wait for flip animation to complete before changing card
      setTimeout(() => {
        setCurrentIndex(newIndex);
        setIsTransitioning(false);
      }, FLIP_DURATION);
    } else {
      // Card is not flipped - navigate immediately
      setCurrentIndex(newIndex);
    }
  }, [isFlipped, isTransitioning, resetFlip]);

  // Navigation handlers
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

  // Swipe gesture handlers
  const swipeHandlers = useSwipe(goToNext, goToPrevious);

  // Audio playback (placeholder)
  const playAudio = () => {
    toast({
      title: 'Audio coming soon!',
      description: `Pronunciation for "${currentWord.chinese}"`,
      status: 'info',
      duration: 1500,
    });
  };

  // Mark word as learning or mastered
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
    <Container maxW="md" h="100vh" py={6} pb="100px">
      <VStack spacing={6} h="100%">
        {/* Progress bar */}
        <ProgressBar stats={stats} />

        {/* Card counter */}
        <Text fontSize="sm" color="gray.500">
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
        <HStack spacing={4} w="100%" justify="center">
          <IconButton
            icon={<FiChevronLeft />}
            onClick={goToPrevious}
            isDisabled={currentIndex === 0 || isTransitioning}
            variant="outline"
            size="lg"
            aria-label="Previous card"
          />
          <IconButton
            icon={<FiChevronRight />}
            onClick={goToNext}
            isDisabled={currentIndex === words.length - 1 || isTransitioning}
            variant="outline"
            size="lg"
            aria-label="Next card"
          />
        </HStack>

        {/* Quick action buttons */}
        <HStack spacing={3} w="100%">
          <Button
            leftIcon={<FiX />}
            flex={1}
            variant="outline"
            colorScheme="gray"
            onClick={handleMarkLearning}
            isDisabled={isTransitioning}
          >
            Still Learning
          </Button>
          <Button
            leftIcon={<FiCheck />}
            flex={1}
            colorScheme="brand"
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
