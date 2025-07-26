import { useState, useEffect, useCallback } from 'react';
import { Workout, UserSettings, Challenge, Achievement, ACHIEVEMENT_DEFINITIONS } from '@/types';
import { workoutService, settingsService, challengeService, achievementService } from '@/lib/firestore';

// Workout hooks
export function useWorkouts(limit?: number) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    try {
      const unsubscribe = workoutService.subscribeToWorkouts(
        (updatedWorkouts) => {
          setWorkouts(updatedWorkouts);
          setLoading(false);
          setError(null);
        },
        limit
      );

      return () => {
        try {
          unsubscribe();
        } catch (err) {
          console.error('Error unsubscribing from workouts:', err);
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workouts');
      setLoading(false);
    }
  }, [limit]);

  const createWorkout = useCallback(async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      return await workoutService.createWorkout(workoutData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workout');
      throw err;
    }
  }, []);

  const updateWorkout = useCallback(async (id: string, updates: Partial<Workout>) => {
    try {
      setError(null);
      await workoutService.updateWorkout(id, updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workout');
      throw err;
    }
  }, []);

  const deleteWorkout = useCallback(async (id: string) => {
    try {
      setError(null);
      await workoutService.deleteWorkout(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workout');
      throw err;
    }
  }, []);

  return {
    workouts,
    loading,
    error,
    createWorkout,
    updateWorkout,
    deleteWorkout,
  };
}

// Single workout hook
export function useWorkout(id: string | null) {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setWorkout(null);
      setLoading(false);
      return;
    }

    const loadWorkout = async () => {
      try {
        setLoading(true);
        setError(null);
        const workoutData = await workoutService.getWorkout(id);
        setWorkout(workoutData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load workout');
      } finally {
        setLoading(false);
      }
    };

    loadWorkout();
  }, [id]);

  return { workout, loading, error };
}

// User settings hook
export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const userSettings = await settingsService.getUserSettings();
        setSettings(userSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    try {
      setError(null);
      await settingsService.updateUserSettings(updates);
      // Reload settings after update
      const userSettings = await settingsService.getUserSettings();
      setSettings(userSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}

// Challenge hook
export function useChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentChallenge = await challengeService.getCurrentChallenge();
        setChallenge(currentChallenge);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, []);

  const createChallenge = useCallback(async (challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const id = await challengeService.createChallenge(challengeData);
      // Reload challenge after creation
      const currentChallenge = await challengeService.getCurrentChallenge();
      setChallenge(currentChallenge);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
      throw err;
    }
  }, []);

  const updateChallenge = useCallback(async (id: string, updates: Partial<Challenge>) => {
    try {
      setError(null);
      await challengeService.updateChallenge(id, updates);
      // Reload challenge after update
      const currentChallenge = await challengeService.getCurrentChallenge();
      setChallenge(currentChallenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update challenge');
      throw err;
    }
  }, []);

  return {
    challenge,
    loading,
    error,
    createChallenge,
    updateChallenge,
  };
}

// Achievements hook
export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = achievementService.subscribeToAchievements(
      (updatedAchievements) => {
        setAchievements(updatedAchievements);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, []);

  const initializeAchievements = useCallback(async () => {
    try {
      setError(null);
      // Check if achievements already exist
      const existingAchievements = await achievementService.getAchievements();
      
      if (existingAchievements.length === 0) {
        // Initialize with default achievements
        const defaultAchievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
          ...def,
          unlocked: false,
        }));
        
        await achievementService.initializeAchievements(defaultAchievements);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize achievements');
      throw err;
    }
  }, []);

  const unlockAchievement = useCallback(async (achievementId: string) => {
    try {
      setError(null);
      await achievementService.unlockAchievement(achievementId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock achievement');
      throw err;
    }
  }, []);

  return {
    achievements,
    loading,
    error,
    initializeAchievements,
    unlockAchievement,
  };
}

// Progress calculation hook
export function useProgressStats() {
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { challenge, loading: challengeLoading } = useChallenge();

  const [stats, setStats] = useState({
    completedWorkouts: 0,
    totalSwings: 0,
    averageTime: 0,
    progressPercentage: 0,
    remainingWorkouts: 20,
    consecutiveDays: 0,
    weeklyWorkouts: 0,
    exerciseVariety: 0,
    bestTime: 0,
  });

  useEffect(() => {
    if (workoutsLoading || challengeLoading) return;

    const completedWorkouts = workouts.filter(w => w.completed).length;
    const totalSwings = completedWorkouts * 100; // Each workout is 100 swings
    
    // Calculate average time
    const completedWorkoutTimes = workouts
      .filter(w => w.completed)
      .map(w => w.totalTimeMinutes + w.totalTimeSeconds / 60);
    const averageTime = completedWorkoutTimes.length > 0 
      ? completedWorkoutTimes.reduce((sum, time) => sum + time, 0) / completedWorkoutTimes.length
      : 0;

    // Calculate progress percentage
    const progressPercentage = (completedWorkouts / 20) * 100;

    // Calculate best time
    const bestTime = completedWorkoutTimes.length > 0 
      ? Math.min(...completedWorkoutTimes)
      : 0;

    // Calculate consecutive days
    const sortedWorkouts = workouts
      .filter(w => w.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let consecutiveDays = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === consecutiveDays) {
        consecutiveDays++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }

    // Calculate weekly workouts (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyWorkouts = workouts.filter(w => 
      w.completed && w.date >= oneWeekAgo
    ).length;

    // Calculate exercise variety
    const uniqueExercises = new Set(
      workouts.filter(w => w.completed).map(w => w.strengthExercise)
    );
    const exerciseVariety = uniqueExercises.size;

    setStats({
      completedWorkouts,
      totalSwings,
      averageTime,
      progressPercentage,
      remainingWorkouts: 20 - completedWorkouts,
      consecutiveDays,
      weeklyWorkouts,
      exerciseVariety,
      bestTime,
    });
  }, [workouts, challenge, workoutsLoading, challengeLoading]);

  return {
    stats,
    loading: workoutsLoading || challengeLoading,
  };
}