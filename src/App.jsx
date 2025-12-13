import { useState, useEffect } from 'react';
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react';
import { HomeScreen } from './screens/HomeScreen';
import { CategoryScreen } from './screens/CategoryScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { Navigation } from './components/Navigation';
import { useProgress, useCategoryProgress } from './hooks/useProgress';
import { categories } from './data/categories';
import theme from './theme/theme';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryWords, setCategoryWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const categoryProgress = useCategoryProgress(categories);
  const { words, updateWordStatus, stats, resetProgress } = useProgress(
    categoryWords,
    selectedCategory || 'default'
  );

  // Load category data when selected
  useEffect(() => {
    if (selectedCategory) {
      setIsLoading(true);
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        category.getData().then(data => {
          setCategoryWords(data);
          setIsLoading(false);
        });
      }
    }
  }, [selectedCategory]);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleStartLearning = () => {
    setCurrentScreen('categories');
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentScreen('flashcard');
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setCategoryWords([]);
    setCurrentScreen('categories');
  };

  // Calculate total stats across all categories
  const totalStats = Object.values(categoryProgress).reduce(
    (acc, cat) => ({
      total: acc.total + (cat.total || 0),
      mastered: acc.mastered + (cat.mastered || 0),
      learning: acc.learning + (cat.learning || 0),
      notSeen: acc.notSeen + (cat.notSeen || 0),
    }),
    { total: 0, mastered: 0, learning: 0, notSeen: 0 }
  );

  // Get current category info
  const currentCategory = selectedCategory
    ? categories.find(c => c.id === selectedCategory)
    : null;

  return (
    <ChakraProvider theme={theme}>
      {/* Loading spinner */}
      {isLoading && (
        <Center minH="100vh" bg="gray.900">
          <Spinner size="xl" color="green.500" />
        </Center>
      )}

      {/* Render current screen */}
      {!isLoading && currentScreen === 'home' && (
        <HomeScreen onStartLearning={handleStartLearning} stats={totalStats} />
      )}

      {!isLoading && currentScreen === 'categories' && (
        <CategoryScreen
          onSelectCategory={handleSelectCategory}
          categoryProgress={categoryProgress}
        />
      )}

      {!isLoading && currentScreen === 'flashcard' && words.length > 0 && (
        <FlashcardScreen
          words={words}
          stats={stats}
          onUpdateStatus={updateWordStatus}
          categoryName={currentCategory?.name}
          categoryIcon={currentCategory?.icon}
          onBackToCategories={handleBackToCategories}
        />
      )}

      {!isLoading && currentScreen === 'progress' && (
        <ProgressScreen
          stats={selectedCategory ? stats : totalStats}
          categoryName={currentCategory?.name}
          categories={categories}
          categoryProgress={categoryProgress}
        />
      )}

      {/* Bottom navigation */}
      {!isLoading && currentScreen !== 'home' && (
        <Navigation
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          showCategories={currentScreen !== 'categories'}
          onCategoriesClick={handleBackToCategories}
        />
      )}
    </ChakraProvider>
  );
}

export default App;
