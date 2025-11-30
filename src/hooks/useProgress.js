import { useState, useEffect } from 'react';

const STORAGE_KEY = 'noodles_progress';
const DATA_VERSION = 5; // Increment when data structure changes

/**
 * Custom hook for tracking learning progress
 * Stores word statuses in localStorage
 * @param {Array} initialWords - Initial vocabulary data
 * @returns {Object} { words, updateWordStatus, stats, resetProgress }
 */
export const useProgress = (initialWords) => {
  const [words, setWords] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedVersion = localStorage.getItem(STORAGE_KEY + '_version');

    // Check if we need to migrate or refresh data
    if (savedVersion !== String(DATA_VERSION)) {
      // Version mismatch - migrate status from old data to new structure
      if (saved) {
        try {
          const oldData = JSON.parse(saved);
          // Merge: use new word data but preserve status from old data
          const migratedWords = initialWords.map(word => {
            const oldWord = oldData.find(w => w.id === word.id);
            if (oldWord && oldWord.status) {
              return { ...word, status: oldWord.status };
            }
            return word;
          });
          // Save migrated data immediately
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedWords));
          localStorage.setItem(STORAGE_KEY + '_version', String(DATA_VERSION));
          return migratedWords;
        } catch (e) {
          console.error('Migration failed', e);
        }
      }
      // No old data or migration failed - use fresh data
      localStorage.setItem(STORAGE_KEY + '_version', String(DATA_VERSION));
      return initialWords;
    }

    // Version matches - load saved data
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved progress', e);
        return initialWords;
      }
    }

    return initialWords;
  });

  // Save to localStorage whenever words change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    localStorage.setItem(STORAGE_KEY + '_version', String(DATA_VERSION));
  }, [words]);

  /**
   * Update a word's learning status
   */
  const updateWordStatus = (wordId, newStatus) => {
    setWords(prevWords =>
      prevWords.map(word =>
        word.id === wordId ? { ...word, status: newStatus } : word
      )
    );
  };

  /**
   * Reset all progress
   */
  const resetProgress = () => {
    setWords(initialWords);
  };

  // Calculate statistics
  const stats = {
    total: words.length,
    notSeen: words.filter(w => w.status === 'not_seen').length,
    learning: words.filter(w => w.status === 'learning').length,
    mastered: words.filter(w => w.status === 'mastered').length,
  };

  return { words, updateWordStatus, stats, resetProgress };
};
