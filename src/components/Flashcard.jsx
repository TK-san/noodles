import { Box, VStack, Text, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FiVolume2 } from 'react-icons/fi';

/**
 * Highlights the target Chinese word in the example sentence
 */
const HighlightWord = ({ example, chinese }) => {
  const highlightColor = useColorModeValue('red.600', 'red.400');

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
      result.push(
        <Text
          as="span"
          key={`word-${index}`}
          fontWeight="bold"
          color={highlightColor}
        >
          {chinese}
        </Text>
      );
    }
    if (part) {
      result.push(<Text as="span" key={`part-${index}`}>{part}</Text>);
    }
  });

  return <>{result}</>;
};

/**
 * Flashcard component optimized for iPhone 12 Pro (390x844)
 * Card size reduced by 10% for better fit
 */
export const Flashcard = ({ word, isFlipped, onFlip, onPlayAudio }) => {
  // Color mode values
  const cardFrontBg = useColorModeValue('white', 'gray.800');
  const cardBackBg = useColorModeValue('#FFF8E7', 'gray.700');
  const chineseColor = useColorModeValue('gray.800', 'white');
  const pinyinColor = useColorModeValue('gray.600', 'gray.300');
  const englishColor = useColorModeValue('red.600', 'red.400');
  const exampleBoxBg = useColorModeValue('white', 'gray.800');
  const exampleTextColor = useColorModeValue('gray.700', 'gray.200');
  const examplePinyinColor = useColorModeValue('gray.500', 'gray.400');
  const exampleEnglishColor = useColorModeValue('gray.600', 'gray.300');
  const hintColor = useColorModeValue('gray.400', 'gray.500');
  const shadowColor = useColorModeValue('rgba(0,0,0,0.12)', 'rgba(0,0,0,0.4)');

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
    boxShadow: `0 8px 32px ${shadowColor}`,
  };

  return (
    <Box
      w="90%"
      maxW="340px"
      h="380px"
      position="relative"
      style={{ perspective: '1000px' }}
      onClick={onFlip}
      cursor="pointer"
    >
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
        {/* Front of card */}
        <Box
          style={{
            ...cardFaceStyle,
            backgroundColor: cardFrontBg,
          }}
          p={6}
        >
          <VStack spacing={4}>
            <Text fontSize="6xl" fontWeight="bold" color={chineseColor}>
              {word.chinese}
            </Text>
            <Text fontSize="xs" color={hintColor} mt={4}>
              Tap to see meaning
            </Text>
          </VStack>
        </Box>

        {/* Back of card */}
        <Box
          style={{
            ...cardFaceStyle,
            backgroundColor: cardBackBg,
            transform: 'rotateY(180deg)',
          }}
          p={4}
        >
          <VStack spacing={2} w="100%">
            {/* Pinyin */}
            <Text fontSize="xl" color={pinyinColor} fontStyle="italic">
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
              size="sm"
              aria-label="Play pronunciation"
            />

            {/* English meaning */}
            <Text fontSize="2xl" fontWeight="bold" color={englishColor} textAlign="center">
              {word.english}
            </Text>

            {/* Example sentence box */}
            <Box
              mt={1}
              p={3}
              bg={exampleBoxBg}
              borderRadius="md"
              borderLeft="3px solid"
              borderColor="red.500"
              w="100%"
            >
              <VStack spacing={1}>
                <Text fontSize="sm" color={exampleTextColor} textAlign="center">
                  <HighlightWord example={word.exampleChinese} chinese={word.chinese} />
                </Text>
                <Text fontSize="xs" color={examplePinyinColor} fontStyle="italic" textAlign="center">
                  {word.examplePinyin}
                </Text>
                <Text fontSize="xs" color={exampleEnglishColor} textAlign="center">
                  {word.exampleEnglish}
                </Text>
              </VStack>
            </Box>

            <Text fontSize="xs" color={hintColor} mt={2}>
              Tap to flip back
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};
