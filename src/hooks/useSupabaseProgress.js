import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'noodles_progress';
const DATA_VERSION = 6;

/**
 * Hook for tracking learning progress with Supabase sync
 * Falls back to localStorage when offline or not authenticated
 */
export const useSupabaseProgress = (initialWords, categoryId = 'default') => {
  const { user, isOfflineMode } = useAuth();
  const storageKey = `${STORAGE_KEY}_${categoryId}`;
  const [words, setWords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Debounce timer for batch updates
  const syncTimeoutRef = useRef(null);
  const pendingUpdatesRef = useRef(new Map());

  // Load initial words from localStorage
  const loadFromLocalStorage = useCallback(() => {
    const saved = localStorage.getItem(storageKey);
    const savedVersion = localStorage.getItem(storageKey + '_version');

    if (savedVersion !== String(DATA_VERSION)) {
      if (saved) {
        try {
          const oldData = JSON.parse(saved);
          const migratedWords = initialWords.map(word => {
            const oldWord = oldData.find(w => w.id === word.id);
            if (oldWord && oldWord.status) {
              return { ...word, status: oldWord.status };
            }
            return word;
          });
          localStorage.setItem(storageKey, JSON.stringify(migratedWords));
          localStorage.setItem(storageKey + '_version', String(DATA_VERSION));
          return migratedWords;
        } catch (e) {
          console.error('Migration failed', e);
        }
      }
      localStorage.setItem(storageKey + '_version', String(DATA_VERSION));
      return initialWords;
    }

    if (saved) {
      try {
        const savedData = JSON.parse(saved);
        return initialWords.map(word => {
          const savedWord = savedData.find(w => w.id === word.id);
          if (savedWord && savedWord.status) {
            return { ...word, status: savedWord.status };
          }
          return word;
        });
      } catch (e) {
        console.error('Failed to parse saved progress', e);
        return initialWords;
      }
    }

    return initialWords;
  }, [initialWords, storageKey]);

  // Load progress from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) return null;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('word_id, status')
        .eq('user_id', user.id)
        .eq('category_id', categoryId);

      if (error) {
        console.error('Failed to load from Supabase:', error);
        return null;
      }

      // Create a map of word_id -> status
      const progressMap = new Map();
      data.forEach(item => {
        progressMap.set(item.word_id, item.status);
      });

      return progressMap;
    } catch (e) {
      console.error('Supabase load error:', e);
      return null;
    }
  }, [user, categoryId]);

  // Sync pending updates to Supabase (debounced)
  const syncToSupabase = useCallback(async () => {
    if (!isSupabaseConfigured() || !user || pendingUpdatesRef.current.size === 0) return;

    setIsSyncing(true);
    const updates = Array.from(pendingUpdatesRef.current.entries());
    pendingUpdatesRef.current.clear();

    try {
      // Upsert all pending updates
      const { error } = await supabase
        .from('user_progress')
        .upsert(
          updates.map(([wordId, status]) => ({
            user_id: user.id,
            word_id: wordId,
            category_id: categoryId,
            status,
            last_reviewed: new Date().toISOString(),
          })),
          { onConflict: 'user_id,word_id' }
        );

      if (error) {
        console.error('Failed to sync to Supabase:', error);
        // Re-add failed updates
        updates.forEach(([wordId, status]) => {
          pendingUpdatesRef.current.set(wordId, status);
        });
      }
    } catch (e) {
      console.error('Supabase sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [user, categoryId]);

  // Queue an update for syncing
  const queueUpdate = useCallback((wordId, status) => {
    pendingUpdatesRef.current.set(wordId, status);

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set new timeout for batch sync (5 seconds)
    syncTimeoutRef.current = setTimeout(() => {
      syncToSupabase();
    }, 5000);
  }, [syncToSupabase]);

  // Initialize: load from localStorage, then merge with Supabase
  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);

      // Always start with localStorage data
      const localWords = loadFromLocalStorage();
      setWords(localWords);

      // If authenticated, merge with Supabase data
      if (user && !isOfflineMode && isSupabaseConfigured()) {
        const supabaseProgress = await loadFromSupabase();
        if (supabaseProgress && supabaseProgress.size > 0) {
          // Merge: Supabase takes precedence
          const mergedWords = localWords.map(word => {
            const supabaseStatus = supabaseProgress.get(word.id);
            if (supabaseStatus) {
              return { ...word, status: supabaseStatus };
            }
            return word;
          });
          setWords(mergedWords);
          // Update localStorage with merged data
          localStorage.setItem(storageKey, JSON.stringify(mergedWords));
        }
      }

      setIsLoading(false);
    };

    if (initialWords.length > 0) {
      loadProgress();
    }

    // Cleanup timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        // Force sync remaining updates
        syncToSupabase();
      }
    };
  }, [categoryId, initialWords, user, isOfflineMode]);

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

    // Queue for Supabase sync if authenticated
    if (user && !isOfflineMode && isSupabaseConfigured()) {
      queueUpdate(wordId, newStatus);
    }
  }, [user, isOfflineMode, queueUpdate]);

  /**
   * Reset all progress for current category
   */
  const resetProgress = useCallback(async () => {
    const resetWords = initialWords.map(w => ({ ...w, status: 'not_seen' }));
    setWords(resetWords);
    localStorage.setItem(storageKey, JSON.stringify(resetWords));

    // Also reset in Supabase
    if (user && !isOfflineMode && isSupabaseConfigured()) {
      try {
        await supabase
          .from('user_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('category_id', categoryId);
      } catch (e) {
        console.error('Failed to reset Supabase progress:', e);
      }
    }
  }, [initialWords, user, isOfflineMode, categoryId, storageKey]);

  /**
   * Force sync all current progress to Supabase
   */
  const forceSync = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;

    setIsSyncing(true);
    try {
      const wordsWithProgress = words.filter(w => w.status !== 'not_seen');

      if (wordsWithProgress.length > 0) {
        const { error } = await supabase
          .from('user_progress')
          .upsert(
            wordsWithProgress.map(word => ({
              user_id: user.id,
              word_id: word.id,
              category_id: categoryId,
              status: word.status,
              last_reviewed: new Date().toISOString(),
            })),
            { onConflict: 'user_id,word_id' }
          );

        if (error) {
          console.error('Force sync failed:', error);
        }
      }
    } catch (e) {
      console.error('Force sync error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, [user, words, categoryId]);

  // Calculate statistics
  const stats = {
    total: words.length,
    notSeen: words.filter(w => w.status === 'not_seen').length,
    learning: words.filter(w => w.status === 'learning').length,
    mastered: words.filter(w => w.status === 'mastered').length,
  };

  return {
    words,
    updateWordStatus,
    stats,
    resetProgress,
    isLoading,
    isSyncing,
    forceSync,
  };
};

/**
 * Hook to get progress summary for all categories (with Supabase support)
 */
export const useSupabaseCategoryProgress = (categories) => {
  const { user, isOfflineMode } = useAuth();
  const [categoryProgress, setCategoryProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProgress = async () => {
      setIsLoading(true);
      const progress = {};

      // Always load from localStorage first
      for (const cat of categories) {
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
          try {
            const data = await cat.getData();
            progress[cat.id] = {
              total: data.length,
              mastered: 0,
              learning: 0,
              notSeen: data.length,
            };
          } catch (e) {
            progress[cat.id] = { total: 0, mastered: 0, learning: 0, notSeen: 0 };
          }
        }
      }

      setCategoryProgress(progress);

      // If authenticated, update with Supabase data
      if (user && !isOfflineMode && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('user_category_stats')
            .select('*')
            .eq('user_id', user.id);

          if (!error && data) {
            const updatedProgress = { ...progress };
            data.forEach(stat => {
              if (updatedProgress[stat.category_id]) {
                updatedProgress[stat.category_id] = {
                  ...updatedProgress[stat.category_id],
                  mastered: stat.mastered_count,
                  learning: stat.learning_count,
                  notSeen: updatedProgress[stat.category_id].total - stat.mastered_count - stat.learning_count,
                };
              }
            });
            setCategoryProgress(updatedProgress);
          }
        } catch (e) {
          console.error('Failed to load category stats from Supabase:', e);
        }
      }

      setIsLoading(false);
    };

    loadProgress();
  }, [categories, user, isOfflineMode]);

  return { categoryProgress, isLoading };
};
