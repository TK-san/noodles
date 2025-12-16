import { useState, useEffect } from 'react';
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react';
import { HomeScreen } from './screens/HomeScreen';
import { CategoryScreen } from './screens/CategoryScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { LearnScreen } from './screens/LearnScreen';
import { Navigation } from './components/Navigation';
import { useProgress, useCategoryProgress } from './hooks/useProgress';
import { categories } from './data/categories';
import theme from './theme/theme';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryWords, setCategoryWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studyMode, setStudyMode] = useState(null); // 'quick-quiz', 'review-weak', 'daily-challenge', or null

  const categoryProgress = useCategoryProgress(categories);
  const { words, updateWordStatus, stats, resetProgress } = useProgress(
    categoryWords,
    selectedCategory || studyMode || 'default'
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

  // Load words for study modes (quick quiz or review weak)
  useEffect(() => {
    if (studyMode && !selectedCategory) {
      setIsLoading(true);
      loadStudyModeWords(studyMode).then(data => {
        setCategoryWords(data);
        setIsLoading(false);
      });
    }
  }, [studyMode, selectedCategory]);

  // Function to load words for study modes
  const loadStudyModeWords = async (mode) => {
    // Load all words from all categories
    const allWordsPromises = categories.map(cat => cat.getData());
    const allWordsArrays = await Promise.all(allWordsPromises);
    const allWords = allWordsArrays.flat();

    if (mode === 'quick-quiz') {
      // Shuffle and pick 10 random words
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 10);
    } else if (mode === 'daily-challenge') {
      // Shuffle and pick 20 random words for daily challenge
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 20);
    } else if (mode === 'review-weak') {
      // Get words that are in "learning" status from localStorage
      const weakWords = allWords.filter(word => {
        // Check each category's progress for this word
        for (const cat of categories) {
          const stored = localStorage.getItem(`noodles_progress_${cat.id}`);
          if (stored) {
            try {
              const progressArray = JSON.parse(stored);
              // Progress is stored as an array of word objects
              const wordProgress = progressArray.find(w => w.id === word.id);
              if (wordProgress && wordProgress.status === 'learning') {
                return true;
              }
            } catch (e) {
              console.error('Failed to parse progress for', cat.id);
            }
          }
        }
        return false;
      });
      // Shuffle weak words
      return weakWords.sort(() => Math.random() - 0.5);
    }
    return [];
  };

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
    setStudyMode(null);
    setCategoryWords([]);
    setCurrentScreen('categories');
  };

  const handleQuickQuiz = () => {
    setSelectedCategory(null);
    setStudyMode('quick-quiz');
    setCurrentScreen('flashcard');
  };

  const handleReviewWeak = () => {
    setSelectedCategory(null);
    setStudyMode('review-weak');
    setCurrentScreen('flashcard');
  };

  const handleDailyChallenge = () => {
    setSelectedCategory(null);
    setStudyMode('daily-challenge');
    setCurrentScreen('flashcard');
  };

  const handleBackToLearn = () => {
    setSelectedCategory(null);
    setStudyMode(null);
    setCategoryWords([]);
    setCurrentScreen('flashcard');
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
          categoryName={studyMode === 'quick-quiz' ? 'Quick Quiz' : studyMode === 'review-weak' ? 'Review Weak Words' : studyMode === 'daily-challenge' ? 'Daily Challenge' : currentCategory?.name}
          categoryIcon={studyMode === 'quick-quiz' ? '🎲' : studyMode === 'review-weak' ? '🔄' : studyMode === 'daily-challenge' ? '⚡' : currentCategory?.icon}
          onBackToCategories={handleBackToLearn}
        />
      )}

      {!isLoading && currentScreen === 'flashcard' && words.length === 0 && !studyMode && (
        <LearnScreen
          onQuickQuiz={handleQuickQuiz}
          onReviewWeak={handleReviewWeak}
          onDailyChallenge={handleDailyChallenge}
          totalStats={totalStats}
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
