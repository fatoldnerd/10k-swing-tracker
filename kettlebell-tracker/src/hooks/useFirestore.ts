import { useState, useEffect, useCallback } from 'react';
import { Workout, UserSettings, Challenge, Achievement, ACHIEVEMENT_DEFINITIONS } from '@/types';
import { workoutService, settingsService, challengeService, achievementService } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

// Workout hooks
export function useWorkouts(limit?: number) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const unsubscribe = workoutService.subscribeToWorkouts(
        user,
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
  }, [user, limit]);

  const createWorkout = useCallback(async (workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      return await workoutService.createWorkout(workoutData, user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workout');
      throw err;
    }
  }, [user]);

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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const userSettings = await settingsService.getUserSettings(user);
        setSettings(userSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await settingsService.updateUserSettings(user, updates);
      // Reload settings after update
      const userSettings = await settingsService.getUserSettings(user);
      setSettings(userSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  }, [user]);

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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setChallenge(null);
      setLoading(false);
      return;
    }

    const loadChallenge = async () => {
      try {
        setLoading(true);
        setError(null);
        const currentChallenge = await challengeService.getCurrentChallenge(user);
        setChallenge(currentChallenge);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenge');
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [user]);

  const createChallenge = useCallback(async (challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      const id = await challengeService.createChallenge(challengeData, user);
      // Reload challenge after creation
      const currentChallenge = await challengeService.getCurrentChallenge(user);
      setChallenge(currentChallenge);
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
      throw err;
    }
  }, [user]);

  const updateChallenge = useCallback(async (id: string, updates: Partial<Challenge>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      await challengeService.updateChallenge(id, updates);
      // Reload challenge after update
      const currentChallenge = await challengeService.getCurrentChallenge(user);
      setChallenge(currentChallenge);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update challenge');
      throw err;
    }
  }, [user]);

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
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setAchievements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = achievementService.subscribeToAchievements(
      user,
      (updatedAchievements) => {
        setAchievements(updatedAchievements);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const initializeAchievements = useCallback(async () => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setError(null);
      // Check if achievements already exist
      const existingAchievements = await achievementService.getAchievements(user);
      
      if (existingAchievements.length === 0) {
        // Initialize with default achievements
        const defaultAchievements = ACHIEVEMENT_DEFINITIONS.map(def => ({
          ...def,
          unlocked: false,
        }));
        
        await achievementService.initializeAchievements(defaultAchievements, user);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize achievements');
      throw err;
    }
  }, [user]);

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

// Shared workout data hook - optimized to fetch all data once
export function useSharedWorkoutData() {
  const { workouts, loading: workoutsLoading } = useWorkouts(); // Fetch all workouts once
  const { challenge, loading: challengeLoading } = useChallenge();

  // Return both raw workouts and loading state for sharing
  return {
    workouts,
    recentWorkouts: workouts.slice(0, 5), // First 5 for recent workouts section
    loading: workoutsLoading || challengeLoading,
    workoutsLoading,
    challengeLoading,
    challenge
  };
}

// Progress calculation hook - now uses shared data
export function useProgressStats() {
  const { workouts, workoutsLoading, challengeLoading, challenge } = useSharedWorkoutData();

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
    const totalSwings = completedWorkouts * 500; // Each workout is 500 swings
    
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