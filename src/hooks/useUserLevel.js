import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserLevel,
  updateUserLevel,
  calculateLevel,
  wordsToNextLevel,
  LEVEL_THRESHOLDS,
} from '../services/vocabularyService';

const LEVEL_NAMES = {
  1: 'Beginner',
  2: 'Elementary',
  3: 'Intermediate',
  4: 'Advanced',
  5: 'Expert',
};

const LEVEL_COLORS = {
  1: 'gray',
  2: 'blue',
  3: 'green',
  4: 'purple',
  5: 'gold',
};

/**
 * Hook for managing user level and progression
 */
export const useUserLevel = () => {
  const { user, isOfflineMode } = useAuth();
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalMastered, setTotalMastered] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load user level on mount
  useEffect(() => {
    const loadLevel = async () => {
      setIsLoading(true);

      if (user && !isOfflineMode) {
        const data = await getUserLevel(user.id);
        setLevel(data.level);
        setXp(data.xp);
        setStreak(data.streak);
        setTotalMastered(data.totalMastered || 0);
      } else {
        // Offline mode: calculate from localStorage
        const masteredCount = calculateLocalMastered();
        const calculatedLevel = calculateLevel(masteredCount);
        setLevel(calculatedLevel);
        setTotalMastered(masteredCount);
      }

      setIsLoading(false);
    };

    loadLevel();
  }, [user, isOfflineMode]);

  // Calculate mastered words from localStorage
  const calculateLocalMastered = () => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('noodles_progress_') && !key.endsWith('_version')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(data)) {
            count += data.filter(w => w.status === 'mastered').length;
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return count;
  };

  // Update level when mastered count changes
  const refreshLevel = useCallback(async (newMasteredCount) => {
    const newLevel = calculateLevel(newMasteredCount);
    const previousLevel = level;

    setTotalMastered(newMasteredCount);
    setLevel(newLevel);

    // Update in Supabase if authenticated
    if (user && !isOfflineMode) {
      const result = await updateUserLevel(user.id, newMasteredCount);
      if (result?.streak) {
        setStreak(result.streak);
      }
    }

    // Return level up info if leveled up
    if (newLevel > previousLevel) {
      return {
        leveledUp: true,
        previousLevel,
        newLevel,
        levelName: LEVEL_NAMES[newLevel],
      };
    }

    return { leveledUp: false };
  }, [user, isOfflineMode, level]);

  // Get progress to next level
  const progressToNextLevel = () => {
    if (level >= 5) return { current: totalMastered, target: totalMastered, percent: 100 };

    const currentThreshold = LEVEL_THRESHOLDS[level];
    const nextThreshold = LEVEL_THRESHOLDS[level + 1];
    const progress = totalMastered - currentThreshold;
    const required = nextThreshold - currentThreshold;
    const percent = Math.min(100, Math.round((progress / required) * 100));

    return {
      current: progress,
      target: required,
      percent,
      remaining: wordsToNextLevel(totalMastered, level),
    };
  };

  // Check if extended vocabulary is unlocked
  const hasExtendedAccess = level >= 3;

  return {
    level,
    levelName: LEVEL_NAMES[level],
    levelColor: LEVEL_COLORS[level],
    xp,
    streak,
    totalMastered,
    isLoading,
    hasExtendedAccess,
    progressToNextLevel,
    refreshLevel,
    LEVEL_THRESHOLDS,
  };
};
