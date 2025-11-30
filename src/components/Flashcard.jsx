import { Box, VStack, Text, IconButton } from '@chakra-ui/react';
import { FiVolume2 } from 'react-icons/fi';

/**
 * Highlights the target Chinese word in the example sentence
 * @param {string} example - The example sentence
 * @param {string} chinese - The Chinese word to highlight
 * @returns {JSX.Element[]} Array of text elements with highlighted word
 */
const highlightWord = (example, chinese) => {
  // Safety check for undefined/null values
  if (!example || !chinese) {
    return <Text as="span">{example || ''}</Text>;
  }

  if (!example.includes(chinese)) {
    return <Text as="span">{example}</Text>;
  }

  const parts = example.split(chinese);
  const result = [];

  parts.forEach((part, index) => {
    if (index > 0) {
      // Add the highlighted Chinese word before this part
      result.push(
        <Text
          as="span"
          key={`word-${index}`}
          fontWeight="bold"
          color="red.600"
          fontSize="lg"
        >
          {chinese}
        </Text>
      );
    }
    if (part) {
      result.push(<Text as="span" key={`part-${index}`}>{part}</Text>);
    }
  });

  return result;
};

/**
 * Flashcard component with flip animation
 * Front: Chinese characters only
 * Back: Pinyin, English meaning, and example sentence
 */
export const Flashcard = ({ word, isFlipped, onFlip, onPlayAudio }) => {
  // Common card face styles
  const cardFaceStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    WebkitBackfaceVisibility: 'hidden',
    backfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '1rem',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
  };

  return (
    <Box
      w="100%"
      maxW="400px"
      h="450px"
      position="relative"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
      cursor="pointer"
    >
      {/* Card container with 3D flip effect */}
      <Box
        w="100%"
        h="100%"
        position="relative"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease-in-out',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card - Chinese characters only */}
        <Box
          style={{
            ...cardFaceStyle,
            backgroundColor: 'white',
          }}
          p={8}
        >
          <VStack spacing={6}>
            <Text fontSize="7xl" fontWeight="bold" color="gray.800">
              {word.chinese}
            </Text>
            <Text fontSize="sm" color="gray.400" mt={8}>
              Tap to see meaning
            </Text>
          </VStack>
        </Box>

        {/* Back of card - Pinyin, meaning, and example */}
        <Box
          style={{
            ...cardFaceStyle,
            backgroundColor: '#FFF8E7',
            transform: 'rotateY(180deg)',
          }}
          p={6}
        >
          <VStack spacing={4} w="100%">
            {/* Pinyin pronunciation */}
            <Text fontSize="2xl" color="gray.600" fontStyle="italic">
              {word.pinyin}
            </Text>

            {/* Audio button */}
            <IconButton
              icon={<FiVolume2 />}
              onClick={(e) => {
                e.stopPropagation();
                onPlayAudio();
              }}
              colorScheme="red"
              variant="outline"
              size="md"
              aria-label="Play pronunciation"
            />

            {/* English meaning */}
            <Text fontSize="3xl" fontWeight="bold" color="red.600" textAlign="center">
              {word.english}
            </Text>

            {/* Example sentence: Chinese + Pinyin + English */}
            <Box
              mt={2}
              p={4}
              bg="white"
              borderRadius="lg"
              borderLeft="4px solid"
              borderColor="red.500"
              w="100%"
            >
              <VStack spacing={2}>
                {/* Chinese sentence with highlighted word */}
                <Text fontSize="md" color="gray.700" textAlign="center">
                  {highlightWord(word.exampleChinese, word.chinese)}
                </Text>
                {/* Pinyin */}
                <Text fontSize="sm" color="gray.500" fontStyle="italic" textAlign="center">
                  {word.examplePinyin}
                </Text>
                {/* English translation */}
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {word.exampleEnglish}
                </Text>
              </VStack>
            </Box>

            <Text fontSize="sm" color="gray.400" mt={4}>
              Tap to flip back
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};
