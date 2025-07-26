// Workout types
export interface WorkoutRound {
  id: string;
  workoutId: string;
  roundNumber: number; // 1-4
  timeMinutes: number;
  timeSeconds: number;
  createdAt: Date;
}

export interface Workout {
  id: string;
  date: Date;
  strengthExercise: StrengthExercise;
  kettlebellWeight: number; // kg
  totalTimeMinutes: number;
  totalTimeSeconds: number;
  completed: boolean;
  notes?: string;
  rounds: WorkoutRound[];
  createdAt: Date;
  updatedAt: Date;
}

// Strength exercises available
export type StrengthExercise = 
  | 'Dips'
  | 'Push-ups'
  | 'Pull-ups'
  | 'Goblet Squats'
  | 'Military Press';

// User settings
export interface UserSettings {
  id: string;
  preferredKettlebellWeight: number;
  challengeStartDate: Date;
  targetCompletionDays: number;
  createdAt: Date;
  updatedAt: Date;
}

// Challenge tracking
export interface Challenge {
  id: string;
  startDate: Date;
  endDate?: Date;
  targetDays: number;
  completed: boolean;
  workoutsCompleted: number;
  totalWorkouts: number; // always 20 for 10K challenge
  createdAt: Date;
  updatedAt: Date;
}

// Achievement system
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  criteria: AchievementCriteria;
}

export interface AchievementCriteria {
  type: 'workouts_completed' | 'time_under' | 'consecutive_days' | 'weekly_count' | 'total_swings' | 'exercise_variety' | 'challenge_complete';
  value: number;
  period?: 'week' | 'day';
}

// Round structure for the 10K challenge
export interface RoundStructure {
  roundNumber: number;
  swings: number;
  strengthReps: number;
}

export const ROUND_STRUCTURES: RoundStructure[] = [
  { roundNumber: 1, swings: 10, strengthReps: 5 },
  { roundNumber: 2, swings: 15, strengthReps: 3 },
  { roundNumber: 3, swings: 25, strengthReps: 2 },
  { roundNumber: 4, swings: 50, strengthReps: 0 },
];

// Kettlebell weight options
export const KETTLEBELL_WEIGHTS = [8, 12, 16, 20, 24, 28, 32] as const;

// Strength exercises list
export const STRENGTH_EXERCISES: StrengthExercise[] = [
  'Dips',
  'Push-ups',
  'Pull-ups',
  'Goblet Squats',
  'Military Press',
];

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'id' | 'unlocked' | 'unlockedAt'>[] = [
  {
    name: 'First Steps',
    description: 'Complete your first workout',
    icon: '🎯',
    color: 'from-green-400 to-blue-500',
    criteria: { type: 'workouts_completed', value: 1 }
  },
  {
    name: 'Consistency Rookie',
    description: 'Complete 5 workouts',
    icon: '💪',
    color: 'from-blue-400 to-purple-500',
    criteria: { type: 'workouts_completed', value: 5 }
  },
  {
    name: 'Speed Demon',
    description: 'Complete a workout under 30 minutes',
    icon: '⚡',
    color: 'from-yellow-400 to-orange-500',
    criteria: { type: 'time_under', value: 30 }
  },
  {
    name: 'Weekly Warrior',
    description: 'Complete 4 workouts in one week',
    icon: '🔥',
    color: 'from-red-400 to-pink-500',
    criteria: { type: 'weekly_count', value: 4, period: 'week' }
  },
  {
    name: 'Streak Starter',
    description: 'Complete workouts on 3 consecutive days',
    icon: '📅',
    color: 'from-indigo-400 to-cyan-500',
    criteria: { type: 'consecutive_days', value: 3 }
  },
  {
    name: 'Century Club',
    description: 'Complete 10 workouts',
    icon: '💯',
    color: 'from-purple-400 to-pink-500',
    criteria: { type: 'workouts_completed', value: 10 }
  },
  {
    name: 'Swing Master',
    description: 'Complete 5,000 total swings',
    icon: '🏆',
    color: 'from-amber-400 to-yellow-500',
    criteria: { type: 'total_swings', value: 5000 }
  },
  {
    name: 'Versatile Athlete',
    description: 'Try all 5 different strength exercises',
    icon: '🎨',
    color: 'from-teal-400 to-green-500',
    criteria: { type: 'exercise_variety', value: 5 }
  },
  {
    name: 'Endurance Champion',
    description: 'Complete the full 20-workout challenge',
    icon: '👑',
    color: 'from-gold-400 to-yellow-600',
    criteria: { type: 'challenge_complete', value: 1 }
  },
  {
    name: 'Efficiency Expert',
    description: 'Complete a workout under 25 minutes',
    icon: '⏱️',
    color: 'from-cyan-400 to-blue-600',
    criteria: { type: 'time_under', value: 25 }
  },
];