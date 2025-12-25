#!/usr/bin/env node
/**
 * Bulk vocabulary import script for Noodles
 *
 * Usage:
 *   node scripts/import-vocabulary.js <json-file> [--category=<id>] [--level=<1-5>]
 *
 * JSON file format:
 * [
 *   {
 *     "chinese": "你好",
 *     "pinyin": "nǐ hǎo",
 *     "english": "hello",
 *     "exampleChinese": "你好，我是...",
 *     "examplePinyin": "nǐ hǎo, wǒ shì...",
 *     "exampleEnglish": "Hello, I am...",
 *     "hskLevel": 1,
 *     "tags": ["greeting", "formal"]
 *   }
 * ]
 *
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_KEY - Your Supabase service role key (NOT anon key)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const jsonFile = args.find(a => !a.startsWith('--'));
const categoryArg = args.find(a => a.startsWith('--category='));
const levelArg = args.find(a => a.startsWith('--level='));
const dryRun = args.includes('--dry-run');

const categoryId = categoryArg ? categoryArg.split('=')[1] : null;
const difficultyLevel = levelArg ? parseInt(levelArg.split('=')[1]) : 3;

if (!jsonFile) {
  console.error('Usage: node import-vocabulary.js <json-file> [--category=<id>] [--level=<1-5>] [--dry-run]');
  console.error('');
  console.error('Options:');
  console.error('  --category=<id>  Category ID for all words (e.g., "business", "medical")');
  console.error('  --level=<1-5>    Difficulty level (default: 3)');
  console.error('  --dry-run        Preview without inserting');
  console.error('');
  console.error('Environment variables:');
  console.error('  SUPABASE_URL         Your Supabase project URL');
  console.error('  SUPABASE_SERVICE_KEY Your Supabase service role key');
  process.exit(1);
}

// Check environment
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required.');
  console.error('');
  console.error('Get your service key from: Supabase Dashboard > Settings > API > service_role key');
  console.error('');
  console.error('Example:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/import-vocabulary.js words.json');
  process.exit(1);
}

// Initialize Supabase with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function importVocabulary() {
  console.log(`\nReading vocabulary from: ${jsonFile}`);

  // Read and parse JSON file
  let words;
  try {
    const filePath = resolve(process.cwd(), jsonFile);
    const content = readFileSync(filePath, 'utf-8');
    words = JSON.parse(content);
  } catch (e) {
    console.error(`Error reading file: ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(words)) {
    console.error('Error: JSON file must contain an array of words');
    process.exit(1);
  }

  console.log(`Found ${words.length} words to import`);
  console.log(`Category: ${categoryId || '(from each word)'}`);
  console.log(`Difficulty level: ${difficultyLevel}`);

  // Transform words to database format
  const dbWords = words.map((word, index) => {
    const cat = categoryId || word.category || 'uncategorized';
    return {
      word_key: `ext-${cat}-${String(index + 1).padStart(4, '0')}`,
      chinese: word.chinese,
      pinyin: word.pinyin,
      english: word.english,
      example_chinese: word.exampleChinese || word.example_chinese || null,
      example_pinyin: word.examplePinyin || word.example_pinyin || null,
      example_english: word.exampleEnglish || word.example_english || null,
      category_id: cat,
      difficulty_level: word.difficultyLevel || word.difficulty_level || difficultyLevel,
      hsk_level: word.hskLevel || word.hsk_level || null,
      frequency_rank: word.frequencyRank || word.frequency_rank || index + 1,
      tags: word.tags || null,
    };
  });

  // Validate
  const invalid = dbWords.filter(w => !w.chinese || !w.pinyin || !w.english);
  if (invalid.length > 0) {
    console.error(`\nError: ${invalid.length} words are missing required fields (chinese, pinyin, english)`);
    console.error('First invalid word:', invalid[0]);
    process.exit(1);
  }

  // Preview
  console.log('\nPreview (first 3 words):');
  dbWords.slice(0, 3).forEach((w, i) => {
    console.log(`  ${i + 1}. ${w.chinese} (${w.pinyin}) - ${w.english}`);
  });

  if (dryRun) {
    console.log('\n[DRY RUN] No changes made.');
    return;
  }

  // Insert in batches
  const batchSize = 100;
  let inserted = 0;
  let errors = 0;

  console.log(`\nInserting ${dbWords.length} words...`);

  for (let i = 0; i < dbWords.length; i += batchSize) {
    const batch = dbWords.slice(i, i + batchSize);

    const { error } = await supabase
      .from('words')
      .upsert(batch, { onConflict: 'word_key' });

    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`\rProgress: ${inserted}/${dbWords.length}`);
    }
  }

  console.log(`\n\nImport complete!`);
  console.log(`  Inserted/Updated: ${inserted}`);
  console.log(`  Errors: ${errors}`);

  // Update category word count
  if (categoryId) {
    const { error } = await supabase
      .from('categories')
      .upsert({
        id: categoryId,
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        name_zh: categoryId,
        word_count: inserted,
        min_level: difficultyLevel >= 3 ? 3 : 1,
      }, { onConflict: 'id' });

    if (error) {
      console.error('Failed to update category:', error.message);
    } else {
      console.log(`  Updated category: ${categoryId}`);
    }
  }
}

importVocabulary().catch(console.error);
