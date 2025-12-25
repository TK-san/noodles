import { useState, useEffect, useCallback } from 'react';
import { ChakraProvider, Spinner, Center, useDisclosure } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './screens/AuthScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CategoryScreen } from './screens/CategoryScreen';
import { CategoryLandingScreen } from './screens/CategoryLandingScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { LearnScreen } from './screens/LearnScreen';
import { Navigation } from './components/Navigation';
import { MigrationPrompt, hasLocalProgressToMigrate } from './components/MigrationPrompt';
import { LevelUpModal } from './components/LevelUpModal';
import { useSupabaseProgress, useSupabaseCategoryProgress } from './hooks/useSupabaseProgress';
import { useUserLevel } from './hooks/useUserLevel';
import { categories } from './data/categories';
import theme from './theme/theme';

function AppContent() {
  const { user, loading: authLoading, isOfflineMode, setIsOfflineMode } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryWords, setCategoryWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [studyMode, setStudyMode] = useState(null);
  const [filterMode, setFilterMode] = useState(null);
  const [showAuth, setShowAuth] = useState(false);

  // Migration modal
  const { isOpen: isMigrationOpen, onOpen: onMigrationOpen, onClose: onMigrationClose } = useDisclosure();

  // Level up modal
  const { isOpen: isLevelUpOpen, onOpen: onLevelUpOpen, onClose: onLevelUpClose } = useDisclosure();
  const [levelUpInfo, setLevelUpInfo] = useState({ previousLevel: 1, newLevel: 1 });

  // User level hook
  const { refreshLevel, totalMastered } = useUserLevel();

  const { categoryProgress } = useSupabaseCategoryProgress(categories);
  const { words, updateWordStatus, stats, isSyncing } = useSupabaseProgress(
    categoryWords,
    selectedCategory || studyMode || 'default'
  );

  // Check for migration on first auth
  useEffect(() => {
    if (user && !isOfflineMode) {
      const shouldMigrate = hasLocalProgressToMigrate(user.id);
      if (shouldMigrate) {
        onMigrationOpen();
      }
    }
  }, [user, isOfflineMode]);

  // Show auth screen if not authenticated and not in offline mode
  useEffect(() => {
    if (!authLoading && !user && !isOfflineMode) {
      setShowAuth(true);
    } else {
      setShowAuth(false);
    }
  }, [user, authLoading, isOfflineMode]);

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

  // Load words for study modes
  useEffect(() => {
    if (studyMode && !selectedCategory) {
      setIsLoading(true);
      loadStudyModeWords(studyMode).then(data => {
        setCategoryWords(data);
        setIsLoading(false);
      });
    }
  }, [studyMode, selectedCategory]);

  const loadStudyModeWords = async (mode) => {
    const allWordsPromises = categories.map(cat => cat.getData());
    const allWordsArrays = await Promise.all(allWordsPromises);
    const allWords = allWordsArrays.flat();

    if (mode === 'quick-quiz') {
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 10);
    } else if (mode === 'daily-challenge') {
      const shuffled = [...allWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 20);
    } else if (mode === 'review-weak') {
      const weakWords = allWords.filter(word => {
        for (const cat of categories) {
          const stored = localStorage.getItem(`noodles_progress_${cat.id}`);
          if (stored) {
            try {
              const progressArray = JSON.parse(stored);
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
      return weakWords.sort(() => Math.random() - 0.5);
    }
    return [];
  };

  // Wrap updateWordStatus to check for level ups
  const handleUpdateWordStatus = useCallback(async (wordId, newStatus) => {
    const previousStatus = words.find(w => w.id === wordId)?.status;
    updateWordStatus(wordId, newStatus);

    // Check for level up when mastering a word
    if (newStatus === 'mastered' && previousStatus !== 'mastered') {
      // Calculate new mastered count
      const newMasteredCount = totalMastered + 1;
      const result = await refreshLevel(newMasteredCount);

      if (result.leveledUp) {
        setLevelUpInfo({
          previousLevel: result.previousLevel,
          newLevel: result.newLevel,
        });
        onLevelUpOpen();
      }
    }
  }, [words, updateWordStatus, totalMastered, refreshLevel, onLevelUpOpen]);

  const handleContinueOffline = () => {
    setIsOfflineMode(true);
    setShowAuth(false);
  };

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleStartLearning = () => {
    setCurrentScreen('categories');
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setFilterMode(null);
    setCurrentScreen('category-landing');
  };

  const handleStudyAll = () => {
    setFilterMode('all');
    setCurrentScreen('flashcard');
  };

  const handleStudyLearning = () => {
    setFilterMode('learning');
    setCurrentScreen('flashcard');
  };

  const handleStudyMastered = () => {
    setFilterMode('mastered');
    setCurrentScreen('flashcard');
  };

  const handleBackToCategoryLanding = () => {
    setFilterMode(null);
    setCurrentScreen('category-landing');
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

  const totalStats = Object.values(categoryProgress).reduce(
    (acc, cat) => ({
      total: acc.total + (cat.total || 0),
      mastered: acc.mastered + (cat.mastered || 0),
      learning: acc.learning + (cat.learning || 0),
      notSeen: acc.notSeen + (cat.notSeen || 0),
    }),
    { total: 0, mastered: 0, learning: 0, notSeen: 0 }
  );

  const currentCategory = selectedCategory
    ? categories.find(c => c.id === selectedCategory)
    : null;

  const filteredWords = filterMode && selectedCategory
    ? words.filter(word => {
        if (filterMode === 'all') return true;
        if (filterMode === 'learning') return word.status === 'learning';
        if (filterMode === 'mastered') return word.status === 'mastered';
        return true;
      })
    : words;

  // Show loading while checking auth
  if (authLoading) {
    return (
      <Center minH="100vh" bg="gray.900">
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  // Show auth screen
  if (showAuth) {
    return <AuthScreen onContinueOffline={handleContinueOffline} />;
  }

  return (
    <>
      {/* Migration prompt modal */}
      {user && (
        <MigrationPrompt
          isOpen={isMigrationOpen}
          onClose={onMigrationClose}
          userId={user.id}
        />
      )}

      {/* Level up celebration modal */}
      <LevelUpModal
        isOpen={isLevelUpOpen}
        onClose={onLevelUpClose}
        newLevel={levelUpInfo.newLevel}
        previousLevel={levelUpInfo.previousLevel}
      />

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

      {!isLoading && currentScreen === 'category-landing' && currentCategory && (
        <CategoryLandingScreen
          category={currentCategory}
          stats={stats}
          onStudyAll={handleStudyAll}
          onStudyLearning={handleStudyLearning}
          onStudyMastered={handleStudyMastered}
          onBack={handleBackToCategories}
        />
      )}

      {!isLoading && currentScreen === 'flashcard' && filteredWords.length > 0 && (
        <FlashcardScreen
          words={filteredWords}
          stats={stats}
          onUpdateStatus={handleUpdateWordStatus}
          categoryName={studyMode === 'quick-quiz' ? 'Quick Quiz' : studyMode === 'review-weak' ? 'Review Weak Words' : studyMode === 'daily-challenge' ? 'Daily Challenge' : filterMode === 'learning' ? `${currentCategory?.name} (Learning)` : filterMode === 'mastered' ? `${currentCategory?.name} (Mastered)` : currentCategory?.name}
          categoryIcon={studyMode === 'quick-quiz' ? '🎲' : studyMode === 'review-weak' ? '🔄' : studyMode === 'daily-challenge' ? '⚡' : currentCategory?.icon}
          onBackToCategories={selectedCategory ? handleBackToCategoryLanding : handleBackToLearn}
          isSyncing={isSyncing}
        />
      )}

      {!isLoading && currentScreen === 'flashcard' && filteredWords.length === 0 && !studyMode && !selectedCategory && (
        <LearnScreen
          onQuickQuiz={handleQuickQuiz}
          onReviewWeak={handleReviewWeak}
          onDailyChallenge={handleDailyChallenge}
          totalStats={totalStats}
        />
      )}

      {!isLoading && currentScreen === 'flashcard' && filteredWords.length === 0 && studyMode === 'review-weak' && (
        <LearnScreen
          onQuickQuiz={handleQuickQuiz}
          onReviewWeak={handleReviewWeak}
          onDailyChallenge={handleDailyChallenge}
          totalStats={totalStats}
          emptyMessage="No weak words to review! Mark words as 'Learning' while studying to see them here."
        />
      )}

      {!isLoading && currentScreen === 'flashcard' && filteredWords.length === 0 && selectedCategory && filterMode && (
        <CategoryLandingScreen
          category={currentCategory}
          stats={stats}
          onStudyAll={handleStudyAll}
          onStudyLearning={handleStudyLearning}
          onStudyMastered={handleStudyMastered}
          onBack={handleBackToCategories}
          emptyMessage={filterMode === 'learning' ? "No words marked as 'Learning' yet. Study all words first!" : filterMode === 'mastered' ? "No words mastered yet. Keep studying!" : null}
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
    </>
  );
}

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;
