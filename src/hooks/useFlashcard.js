import { useState } from 'react';

/**
 * Custom hook for flashcard flip logic
 * @returns {Object} { isFlipped, flipCard, resetFlip }
 */
export const useFlashcard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const flipCard = () => {
    setIsFlipped(prev => !prev);
  };

  const resetFlip = () => {
    setIsFlipped(false);
  };

  return { isFlipped, flipCard, resetFlip };
};
