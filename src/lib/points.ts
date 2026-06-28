export const CATEGORY_BASE_POINTS = {
  study: 15,
  habits: 10,
  breaking_bad: 20,
  career: 25,
  general: 5,
};

export const DIFFICULTY_MULTIPLIER = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

export type GoalCategory = keyof typeof CATEGORY_BASE_POINTS;
export type GoalDifficulty = keyof typeof DIFFICULTY_MULTIPLIER;

export function calculatePoints(category: GoalCategory, difficulty: GoalDifficulty): { base: number, multiplier: number, total: number } {
  const base = CATEGORY_BASE_POINTS[category] || 5;
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty] || 1.0;
  return {
    base,
    multiplier,
    total: Math.round(base * multiplier)
  };
}

export const CATEGORY_LABELS: Record<GoalCategory, string> = {
  study: 'Study & Learning',
  habits: 'Building Habits',
  breaking_bad: 'Breaking Bad Habits',
  career: 'Career & Deep Work',
  general: 'General Tasks'
};

export const DIFFICULTY_LABELS: Record<GoalDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
};
