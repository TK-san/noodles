import { HStack, IconButton, Box, VStack, Text } from '@chakra-ui/react';
import { FiHome, FiBook, FiBarChart2, FiGrid } from 'react-icons/fi';

/**
 * Bottom navigation component
 */
export const Navigation = ({ currentScreen, onNavigate, showCategories, onCategoriesClick }) => {
  const navItems = [
    { id: 'home', icon: FiHome, label: 'Home' },
    { id: 'categories', icon: FiGrid, label: 'Topics', onClick: onCategoriesClick },
    { id: 'flashcard', icon: FiBook, label: 'Learn' },
    { id: 'progress', icon: FiBarChart2, label: 'Progress' },
  ];

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="gray.800"
      borderTop="1px solid"
      borderColor="gray.700"
      boxShadow="lg"
      zIndex={10}
    >
      <HStack
        justify="space-around"
        py={2}
        maxW="500px"
        mx="auto"
      >
        {navItems.map(item => {
          const isActive = currentScreen === item.id;
          return (
            <VStack
              key={item.id}
              spacing={0}
              cursor="pointer"
              onClick={() => item.onClick ? item.onClick() : onNavigate(item.id)}
              opacity={isActive ? 1 : 0.6}
              _hover={{ opacity: 1 }}
              transition="opacity 0.2s"
            >
              <IconButton
                icon={<item.icon size={20} />}
                aria-label={item.label}
                variant="ghost"
                color={isActive ? 'green.400' : 'gray.400'}
                size="sm"
                _hover={{ bg: 'transparent' }}
              />
              <Text
                fontSize="xs"
                color={isActive ? 'green.400' : 'gray.400'}
                mt={-1}
              >
                {item.label}
              </Text>
            </VStack>
          );
        })}
      </HStack>
    </Box>
  );
};
