// Category index - exports all vocabulary modules
export { greetingsData } from './greetings';
export { pronounsData } from './pronouns';
export { numbersTimeData } from './numbersTime';
export { verbsData } from './verbs';
export { adjectivesData } from './adjectives';
export { peoplePlacesData } from './peoplePlaces';
export { thingsData } from './things';
export { golfData } from './golf';
export { foodDrinksData } from './foodDrinks';
export { travelData } from './travel';
export { marketData } from './market';

// Category metadata for UI
export const categories = [
  {
    id: 'greetings',
    name: 'Greetings',
    nameZh: '问候语',
    icon: '👋',
    description: 'Basic greetings and expressions',
    getData: () => import('./greetings').then(m => m.greetingsData)
  },
  {
    id: 'pronouns',
    name: 'Pronouns & Questions',
    nameZh: '代词和疑问词',
    icon: '❓',
    description: 'Pronouns and question words',
    getData: () => import('./pronouns').then(m => m.pronounsData)
  },
  {
    id: 'numbersTime',
    name: 'Numbers & Time',
    nameZh: '数字和时间',
    icon: '🔢',
    description: 'Numbers, dates, and time expressions',
    getData: () => import('./numbersTime').then(m => m.numbersTimeData)
  },
  {
    id: 'verbs',
    name: 'Common Verbs',
    nameZh: '常用动词',
    icon: '🏃',
    description: 'Essential action words',
    getData: () => import('./verbs').then(m => m.verbsData)
  },
  {
    id: 'adjectives',
    name: 'Adjectives',
    nameZh: '形容词',
    icon: '🎨',
    description: 'Descriptive words',
    getData: () => import('./adjectives').then(m => m.adjectivesData)
  },
  {
    id: 'peoplePlaces',
    name: 'People & Places',
    nameZh: '人物和地点',
    icon: '🏠',
    description: 'People, jobs, and locations',
    getData: () => import('./peoplePlaces').then(m => m.peoplePlacesData)
  },
  {
    id: 'things',
    name: 'Everyday Things',
    nameZh: '日常物品',
    icon: '📱',
    description: 'Common objects and items',
    getData: () => import('./things').then(m => m.thingsData)
  },
  {
    id: 'golf',
    name: 'Golf',
    nameZh: '高尔夫',
    icon: '⛳',
    description: 'Golf terminology and phrases',
    getData: () => import('./golf').then(m => m.golfData)
  },
  {
    id: 'foodDrinks',
    name: 'Food & Drinks',
    nameZh: '食物和饮料',
    icon: '🍜',
    description: 'Food, drinks, and dining',
    getData: () => import('./foodDrinks').then(m => m.foodDrinksData)
  },
  {
    id: 'travel',
    name: 'Travel',
    nameZh: '旅行',
    icon: '✈️',
    description: 'Travel and transportation',
    getData: () => import('./travel').then(m => m.travelData)
  },
  {
    id: 'market',
    name: 'Market & Shopping',
    nameZh: '市场购物',
    icon: '🛒',
    description: 'Shopping, bargaining, and commerce',
    getData: () => import('./market').then(m => m.marketData)
  }
];

// Get all words combined
export const getAllWords = async () => {
  const allModules = await Promise.all(
    categories.map(cat => cat.getData())
  );
  return allModules.flat();
};
