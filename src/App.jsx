import { useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { HomeScreen } from './screens/HomeScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { Navigation } from './components/Navigation';
import { useProgress } from './hooks/useProgress';
import { vocabularyData } from './data/words';
import theme from './theme/theme';

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const { words, updateWordStatus, stats } = useProgress(vocabularyData);

  const handleNavigate = (screen) => {
    setCurrentScreen(screen);
  };

  const handleStartLearning = () => {
    setCurrentScreen('flashcard');
  };

  return (
    <ChakraProvider theme={theme}>
      {/* Render current screen */}
      {currentScreen === 'home' && (
        <HomeScreen onStartLearning={handleStartLearning} stats={stats} />
      )}
      {currentScreen === 'flashcard' && (
        <FlashcardScreen 
          words={words} 
          stats={stats}
          onUpdateStatus={updateWordStatus}
        />
      )}
      {currentScreen === 'progress' && (
        <ProgressScreen stats={stats} />
      )}

      {/* Bottom navigation (hidden on home screen) */}
      {currentScreen !== 'home' && (
        <Navigation currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </ChakraProvider>
  );
}

export default App;