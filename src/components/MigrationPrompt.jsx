import { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  VStack,
  Progress,
  useToast,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUploadCloud, FiCheck } from 'react-icons/fi';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { categories } from '../data/categories';

const STORAGE_KEY = 'noodles_progress';
const MIGRATION_FLAG = 'noodles_migrated_to_cloud';

/**
 * Check if user has local progress that hasn't been migrated
 */
export const hasLocalProgressToMigrate = (userId) => {
  const migrationFlag = localStorage.getItem(`${MIGRATION_FLAG}_${userId}`);
  if (migrationFlag === 'true') return false;

  // Check if any category has saved progress
  for (const cat of categories) {
    const saved = localStorage.getItem(`${STORAGE_KEY}_${cat.id}`);
    if (saved) {
      try {
        const words = JSON.parse(saved);
        const hasProgress = words.some(w => w.status !== 'not_seen');
        if (hasProgress) return true;
      } catch (e) {
        continue;
      }
    }
  }
  return false;
};

export const MigrationPrompt = ({ isOpen, onClose, userId }) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  const handleMigrate = async () => {
    if (!isSupabaseConfigured() || !userId) return;

    setIsMigrating(true);
    setProgress(0);

    try {
      const allProgressData = [];

      // Collect all progress from localStorage
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        const saved = localStorage.getItem(`${STORAGE_KEY}_${cat.id}`);

        if (saved) {
          try {
            const words = JSON.parse(saved);
            const wordsWithProgress = words.filter(w => w.status !== 'not_seen');

            wordsWithProgress.forEach(word => {
              allProgressData.push({
                user_id: userId,
                word_id: word.id,
                category_id: cat.id,
                status: word.status,
                last_reviewed: new Date().toISOString(),
              });
            });
          } catch (e) {
            console.error(`Failed to parse progress for ${cat.id}:`, e);
          }
        }

        setProgress(((i + 1) / categories.length) * 50);
      }

      // Upload to Supabase in batches
      if (allProgressData.length > 0) {
        const batchSize = 100;
        for (let i = 0; i < allProgressData.length; i += batchSize) {
          const batch = allProgressData.slice(i, i + batchSize);

          const { error } = await supabase
            .from('user_progress')
            .upsert(batch, { onConflict: 'user_id,word_id' });

          if (error) {
            throw error;
          }

          setProgress(50 + ((i + batchSize) / allProgressData.length) * 50);
        }
      }

      // Mark migration as complete
      localStorage.setItem(`${MIGRATION_FLAG}_${userId}`, 'true');
      setProgress(100);
      setIsComplete(true);

      toast({
        title: 'Migration complete!',
        description: `Successfully synced ${allProgressData.length} words to the cloud.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Migration failed:', error);
      toast({
        title: 'Migration failed',
        description: error.message || 'Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    // Mark as skipped so we don't ask again
    localStorage.setItem(`${MIGRATION_FLAG}_${userId}`, 'skipped');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered closeOnOverlayClick={!isMigrating}>
      <ModalOverlay />
      <ModalContent bg={bgColor} mx={4}>
        <ModalHeader textAlign="center">
          {isComplete ? (
            <VStack>
              <Icon as={FiCheck} boxSize={10} color="green.500" />
              <Text>Migration Complete!</Text>
            </VStack>
          ) : (
            <VStack>
              <Icon as={FiUploadCloud} boxSize={10} color="brand.500" />
              <Text>Sync Your Progress</Text>
            </VStack>
          )}
        </ModalHeader>

        <ModalBody>
          <VStack spacing={4} textAlign="center">
            {!isMigrating && !isComplete && (
              <>
                <Text color={textColor}>
                  We found learning progress saved on this device. Would you like to sync it to your account?
                </Text>
                <Text fontSize="sm" color={textColor}>
                  This will backup your progress to the cloud so you can access it from any device.
                </Text>
              </>
            )}

            {isMigrating && !isComplete && (
              <Box w="100%">
                <Text mb={2} color={textColor}>
                  Syncing your progress...
                </Text>
                <Progress
                  value={progress}
                  colorScheme="brand"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                />
              </Box>
            )}

            {isComplete && (
              <Text color={textColor}>
                Your progress is now safely stored in the cloud!
              </Text>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="center" gap={3}>
          {!isMigrating && !isComplete && (
            <>
              <Button
                colorScheme="brand"
                onClick={handleMigrate}
                leftIcon={<FiUploadCloud />}
              >
                Sync to Cloud
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Skip for Now
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
