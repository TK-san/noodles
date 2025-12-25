import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { categories as staticCategories } from '../data/categories';

// Level thresholds for progression
export const LEVEL_THRESHOLDS = {
  1: 0,      // Beginner: 0-99 words
  2: 100,    // Elementary: 100-299 words
  3: 300,    // Intermediate: 300-799 words (unlock extended)
  4: 800,    // Advanced: 800-1999 words
  5: 2000,   // Expert: 2000+ words
};

// Which levels use static vs Supabase vocabulary
export const STATIC_LEVELS = [1, 2];      // Levels 1-2 use static files
export const EXTENDED_LEVELS = [3, 4, 5]; // Levels 3-5 add Supabase words

/**
 * Calculate user level based on mastered word count
 */
export const calculateLevel = (masteredCount) => {
  if (masteredCount >= LEVEL_THRESHOLDS[5]) return 5;
  if (masteredCount >= LEVEL_THRESHOLDS[4]) return 4;
  if (masteredCount >= LEVEL_THRESHOLDS[3]) return 3;
  if (masteredCount >= LEVEL_THRESHOLDS[2]) return 2;
  return 1;
};

/**
 * Get words to next level
 */
export const wordsToNextLevel = (masteredCount, currentLevel) => {
  if (currentLevel >= 5) return 0;
  return LEVEL_THRESHOLDS[currentLevel + 1] - masteredCount;
};

/**
 * Get all static categories (from local files)
 */
export const getStaticCategories = () => {
  return staticCategories;
};

/**
 * Get extended categories from Supabase
 */
export const getExtendedCategories = async (userLevel = 1) => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .lte('min_level', userLevel)
      .order('sort_order');

    if (error) {
      console.error('Failed to fetch extended categories:', error);
      return [];
    }

    return data || [];
  } catch (e) {
    console.error('Error fetching extended categories:', e);
    return [];
  }
};

/**
 * Get all available categories (static + extended based on level)
 */
export const getAllCategories = async (userLevel = 1) => {
  const static_ = getStaticCategories();

  // Only fetch extended if user is level 3+
  if (userLevel >= 3) {
    const extended = await getExtendedCategories(userLevel);
    // Mark extended categories
    const extendedWithFlag = extended.map(cat => ({
      ...cat,
      isExtended: true,
      getData: () => getExtendedCategoryWords(cat.id, userLevel),
    }));
    return [...static_, ...extendedWithFlag];
  }

  return static_;
};

/**
 * Get words for a static category
 */
export const getStaticCategoryWords = async (categoryId) => {
  const category = staticCategories.find(c => c.id === categoryId);
  if (!category) return [];
  return category.getData();
};

/**
 * Get words for an extended category from Supabase
 */
export const getExtendedCategoryWords = async (categoryId, userLevel = 1, limit = 100, offset = 0) => {
  if (!isSupabaseConfigured()) return [];

  try {
    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('category_id', categoryId)
      .lte('difficulty_level', userLevel)
      .order('frequency_rank', { ascending: true, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch extended words:', error);
      return [];
    }

    // Transform to match static word format
    return (data || []).map(word => ({
      id: word.word_key,
      chinese: word.chinese,
      pinyin: word.pinyin,
      english: word.english,
      exampleChinese: word.example_chinese || '',
      examplePinyin: word.example_pinyin || '',
      exampleEnglish: word.example_english || '',
      category: word.category_id,
      status: 'not_seen',
      isExtended: true,
      hskLevel: word.hsk_level,
      difficultyLevel: word.difficulty_level,
    }));
  } catch (e) {
    console.error('Error fetching extended words:', e);
    return [];
  }
};

/**
 * Get words for any category (auto-detects static vs extended)
 */
export const getCategoryWords = async (categoryId, userLevel = 1) => {
  // Check if it's a static category
  const staticCategory = staticCategories.find(c => c.id === categoryId);
  if (staticCategory) {
    return getStaticCategoryWords(categoryId);
  }

  // Otherwise fetch from Supabase
  return getExtendedCategoryWords(categoryId, userLevel);
};

/**
 * Search words across all sources
 */
export const searchWords = async (query, userLevel = 1, limit = 20) => {
  const results = [];
  const lowerQuery = query.toLowerCase();

  // Search static words first
  for (const category of staticCategories) {
    const words = await category.getData();
    const matches = words.filter(w =>
      w.chinese.includes(query) ||
      w.pinyin.toLowerCase().includes(lowerQuery) ||
      w.english.toLowerCase().includes(lowerQuery)
    );
    results.push(...matches.slice(0, limit));
    if (results.length >= limit) break;
  }

  // Search Supabase if user is level 3+ and need more results
  if (userLevel >= 3 && results.length < limit && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('words')
        .select('*')
        .lte('difficulty_level', userLevel)
        .or(`chinese.ilike.%${query}%,pinyin.ilike.%${query}%,english.ilike.%${query}%`)
        .limit(limit - results.length);

      if (!error && data) {
        const extendedResults = data.map(word => ({
          id: word.word_key,
          chinese: word.chinese,
          pinyin: word.pinyin,
          english: word.english,
          exampleChinese: word.example_chinese || '',
          examplePinyin: word.example_pinyin || '',
          exampleEnglish: word.example_english || '',
          category: word.category_id,
          status: 'not_seen',
          isExtended: true,
        }));
        results.push(...extendedResults);
      }
    } catch (e) {
      console.error('Error searching extended words:', e);
    }
  }

  return results.slice(0, limit);
};

/**
 * Get user's current level from Supabase
 */
export const getUserLevel = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return { level: 1, xp: 0, streak: 0 };

  try {
    const { data, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Failed to fetch user level:', error);
    }

    if (data) {
      return {
        level: data.current_level,
        xp: data.xp_points,
        streak: data.streak_days,
        totalMastered: data.total_words_mastered,
        lastStudyDate: data.last_study_date,
      };
    }

    // Create default level record
    return { level: 1, xp: 0, streak: 0, totalMastered: 0 };
  } catch (e) {
    console.error('Error fetching user level:', e);
    return { level: 1, xp: 0, streak: 0 };
  }
};

/**
 * Update user level in Supabase
 */
export const updateUserLevel = async (userId, masteredCount) => {
  if (!isSupabaseConfigured() || !userId) return;

  const newLevel = calculateLevel(masteredCount);
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get current record
    const { data: existing } = await supabase
      .from('user_levels')
      .select('last_study_date, streak_days')
      .eq('user_id', userId)
      .single();

    // Calculate streak
    let streak = 1;
    if (existing) {
      const lastDate = existing.last_study_date;
      if (lastDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === today) {
          streak = existing.streak_days; // Same day, keep streak
        } else if (lastDate === yesterdayStr) {
          streak = existing.streak_days + 1; // Consecutive day
        }
        // Otherwise reset to 1
      }
    }

    // Upsert level record
    const { error } = await supabase
      .from('user_levels')
      .upsert({
        user_id: userId,
        current_level: newLevel,
        total_words_mastered: masteredCount,
        streak_days: streak,
        last_study_date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Failed to update user level:', error);
    }

    return { level: newLevel, streak };
  } catch (e) {
    console.error('Error updating user level:', e);
  }
};

/**
 * Get statistics about available vocabulary
 */
export const getVocabularyStats = async (userLevel = 1) => {
  let staticTotal = 0;
  for (const cat of staticCategories) {
    const words = await cat.getData();
    staticTotal += words.length;
  }

  let extendedTotal = 0;
  if (userLevel >= 3 && isSupabaseConfigured()) {
    try {
      const { count, error } = await supabase
        .from('words')
        .select('*', { count: 'exact', head: true })
        .lte('difficulty_level', userLevel);

      if (!error) {
        extendedTotal = count || 0;
      }
    } catch (e) {
      console.error('Error getting extended word count:', e);
    }
  }

  return {
    staticTotal,
    extendedTotal,
    totalAvailable: staticTotal + extendedTotal,
    unlocksAt: userLevel < 3 ? 3 : null,
  };
};
