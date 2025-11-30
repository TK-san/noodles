import { HStack, IconButton, Text, Box } from '@chakra-ui/react';
import { FiHome, FiBook, FiBarChart2 } from 'react-icons/fi';

/**
 * Bottom navigation component
 */
export const Navigation = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: FiHome, label: 'Home' },
    { id: 'flashcard', icon: FiBook, label: 'Learn' },
    { id: 'progress', icon: FiBarChart2, label: 'Progress' },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      boxShadow="lg"
      zIndex={10}
    >
      <HStack
        justify="space-around"
        py={3}
        maxW="500px"
        mx="auto"
      >
        {navItems.map(item => (
          <IconButton
            key={item.id}
            icon={<item.icon size={24} />}
            aria-label={item.label}
            variant="ghost"
            colorScheme={currentScreen === item.id ? 'brand' : 'gray'}
            onClick={() => onNavigate(item.id)}
            flexDirection="column"
            height="auto"
            py={2}
          />
        ))}
      </HStack>
    </Box>
  );
};