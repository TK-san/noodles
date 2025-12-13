import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'noodles_progress';
const DATA_VERSION = 6; // Increment when data structure changes

/**
 * Custom hook for tracking learning progress with category support
 * Stores word statuses in localStorage by category
 * @param {Array} initialWords - Initial vocabulary data for current category
 * @param {string} categoryId - Current category ID
 * @returns {Object} { words, updateWordStatus, stats, resetProgress }
 */
export const useProgress = (initialWords, categoryId = 'default') => {
  const storageKey = `${STORAGE_KEY}_${categoryId}`;

  const [words, setWords] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    const savedVersion = localStorage.getItem(storageKey + '_version');

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
          localStorage.setItem(storageKey, JSON.stringify(migratedWords));
          localStorage.setItem(storageKey + '_version', String(DATA_VERSION));
          return migratedWords;
        } catch (e) {
          console.error('Migration failed', e);
        }
      }
      // No old data or migration failed - use fresh data
      localStorage.setItem(storageKey + '_version', String(DATA_VERSION));
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

  // Update words when category changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        // Merge saved status with initial words
        const mergedWords = initialWords.map(word => {
          const savedWord = savedData.find(w => w.id === word.id);
          if (savedWord && savedWord.status) {
            return { ...word, status: savedWord.status };
          }
          return word;
        });
        setWords(mergedWords);
      } catch (e) {
        setWords(initialWords);
      }
    } else {
      setWords(initialWords);
    }
  }, [categoryId, initialWords]);

  // Save to localStorage whenever words change
  useEffect(() => {
    if (words.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(words));
      localStorage.setItem(storageKey + '_version', String(DATA_VERSION));
    }
  }, [words, storageKey]);

  /**
   * Update a word's learning status
   */
  const updateWordStatus = useCallback((wordId, newStatus) => {
    setWords(prevWords =>
      prevWords.map(word =>
        word.id === wordId ? { ...word, status: newStatus } : word
      )
    );
  }, []);

  /**
   * Reset all progress for current category
   */
  const resetProgress = useCallback(() => {
    const resetWords = initialWords.map(w => ({ ...w, status: 'not_seen' }));
    setWords(resetWords);
  }, [initialWords]);

  // Calculate statistics
  const stats = {
    total: words.length,
    notSeen: words.filter(w => w.status === 'not_seen').length,
    learning: words.filter(w => w.status === 'learning').length,
    mastered: words.filter(w => w.status === 'mastered').length,
  };

  return { words, updateWordStatus, stats, resetProgress };
};

/**
 * Hook to get progress summary for all categories
 */
export const useCategoryProgress = (categories) => {
  const [categoryProgress, setCategoryProgress] = useState({});

  useEffect(() => {
    const progress = {};
    categories.forEach(cat => {
      const storageKey = `${STORAGE_KEY}_${cat.id}`;
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        try {
          const words = JSON.parse(saved);
          progress[cat.id] = {
            total: words.length,
            mastered: words.filter(w => w.status === 'mastered').length,
            learning: words.filter(w => w.status === 'learning').length,
            notSeen: words.filter(w => w.status === 'not_seen').length,
          };
        } catch (e) {
          progress[cat.id] = { total: 0, mastered: 0, learning: 0, notSeen: 0 };
        }
      } else {
        // Load category data to get total count
        cat.getData().then(data => {
          setCategoryProgress(prev => ({
            ...prev,
            [cat.id]: {
              total: data.length,
              mastered: 0,
              learning: 0,
              notSeen: data.length,
            }
          }));
        });
        progress[cat.id] = { total: 0, mastered: 0, learning: 0, notSeen: 0 };
      }
    });
    setCategoryProgress(progress);
  }, [categories]);

  return categoryProgress;
};
