import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { Workout, WorkoutRound, UserSettings, Challenge, Achievement } from '@/types';

// Collection names
const COLLECTIONS = {
  WORKOUTS: 'workouts',
  WORKOUT_ROUNDS: 'workout_rounds',
  USER_SETTINGS: 'user_settings',
  CHALLENGES: 'challenges',
  ACHIEVEMENTS: 'achievements',
} as const;

// Utility functions for date conversion
const timestampToDate = (timestamp: Timestamp): Date => timestamp.toDate();
const dateToTimestamp = (date: Date): Timestamp => Timestamp.fromDate(date);

// Workout operations
export const workoutService = {
  // Create new workout with rounds
  async createWorkout(workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) {
    const batch = writeBatch(db);
    
    // Create workout document
    const workoutRef = doc(collection(db, COLLECTIONS.WORKOUTS));
    const workout: Omit<Workout, 'id'> = {
      ...workoutData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    batch.set(workoutRef, {
      ...workout,
      date: dateToTimestamp(workout.date),
      createdAt: dateToTimestamp(workout.createdAt),
      updatedAt: dateToTimestamp(workout.updatedAt),
    });
    
    // Create round documents
    workoutData.rounds.forEach((round) => {
      const roundRef = doc(collection(db, COLLECTIONS.WORKOUT_ROUNDS));
      batch.set(roundRef, {
        ...round,
        workoutId: workoutRef.id,
        createdAt: dateToTimestamp(new Date()),
      });
    });
    
    await batch.commit();
    return workoutRef.id;
  },

  // Get workout by ID
  async getWorkout(id: string): Promise<Workout | null> {
    const workoutDoc = await getDoc(doc(db, COLLECTIONS.WORKOUTS, id));
    if (!workoutDoc.exists()) return null;
    
    const data = workoutDoc.data();
    const rounds = await this.getWorkoutRounds(id);
    
    return {
      id: workoutDoc.id,
      ...data,
      date: timestampToDate(data.date),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      rounds,
    } as Workout;
  },

  // Get all workouts
  async getWorkouts(limitCount?: number): Promise<Workout[]> {
    let q = query(
      collection(db, COLLECTIONS.WORKOUTS),
      orderBy('date', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    const workouts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const rounds = await this.getWorkoutRounds(doc.id);
        
        return {
          id: doc.id,
          ...data,
          date: timestampToDate(data.date),
          createdAt: timestampToDate(data.createdAt),
          updatedAt: timestampToDate(data.updatedAt),
          rounds,
        } as Workout;
      })
    );
    
    return workouts;
  },

  // Get workout rounds
  async getWorkoutRounds(workoutId: string): Promise<WorkoutRound[]> {
    const q = query(
      collection(db, COLLECTIONS.WORKOUT_ROUNDS),
      where('workoutId', '==', workoutId),
      orderBy('roundNumber', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: timestampToDate(data.createdAt),
      } as WorkoutRound;
    });
  },

  // Update workout
  async updateWorkout(id: string, updates: Partial<Workout>) {
    const workoutRef = doc(db, COLLECTIONS.WORKOUTS, id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: dateToTimestamp(new Date()),
    };
    
    if (updates.date) {
      updateData.date = dateToTimestamp(updates.date);
    }
    
    await updateDoc(workoutRef, updateData);
  },

  // Delete workout and its rounds
  async deleteWorkout(id: string) {
    const batch = writeBatch(db);
    
    // Delete workout
    batch.delete(doc(db, COLLECTIONS.WORKOUTS, id));
    
    // Delete associated rounds
    const rounds = await this.getWorkoutRounds(id);
    rounds.forEach((round) => {
      batch.delete(doc(db, COLLECTIONS.WORKOUT_ROUNDS, round.id));
    });
    
    await batch.commit();
  },

  // Subscribe to workouts (real-time)
  subscribeToWorkouts(callback: (workouts: Workout[]) => void, limitCount?: number) {
    let q = query(
      collection(db, COLLECTIONS.WORKOUTS),
      orderBy('date', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    return onSnapshot(q, async (snapshot) => {
      const workouts = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const rounds = await this.getWorkoutRounds(doc.id);
          
          return {
            id: doc.id,
            ...data,
            date: timestampToDate(data.date),
            createdAt: timestampToDate(data.createdAt),
            updatedAt: timestampToDate(data.updatedAt),
            rounds,
          } as Workout;
        })
      );
      
      callback(workouts);
    });
  },
};

// User settings operations
export const settingsService = {
  async getUserSettings(): Promise<UserSettings | null> {
    const q = query(collection(db, COLLECTIONS.USER_SETTINGS), limit(1));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      challengeStartDate: timestampToDate(data.challengeStartDate),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as UserSettings;
  },

  async updateUserSettings(settings: Partial<UserSettings>) {
    const existing = await this.getUserSettings();
    
    if (existing) {
      const settingsRef = doc(db, COLLECTIONS.USER_SETTINGS, existing.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        ...settings,
        updatedAt: dateToTimestamp(new Date()),
      };
      
      if (settings.challengeStartDate) {
        updateData.challengeStartDate = dateToTimestamp(settings.challengeStartDate);
      }
      
      await updateDoc(settingsRef, updateData);
    } else {
      const newSettings: Omit<UserSettings, 'id'> = {
        preferredKettlebellWeight: 16,
        challengeStartDate: new Date(),
        targetCompletionDays: 30,
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await addDoc(collection(db, COLLECTIONS.USER_SETTINGS), {
        ...newSettings,
        challengeStartDate: dateToTimestamp(newSettings.challengeStartDate),
        createdAt: dateToTimestamp(newSettings.createdAt),
        updatedAt: dateToTimestamp(newSettings.updatedAt),
      });
    }
  },
};

// Challenge operations
export const challengeService = {
  async getCurrentChallenge(): Promise<Challenge | null> {
    const q = query(
      collection(db, COLLECTIONS.CHALLENGES),
      where('completed', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      startDate: timestampToDate(data.startDate),
      endDate: data.endDate ? timestampToDate(data.endDate) : undefined,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as Challenge;
  },

  async createChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt'>) {
    const challenge: Omit<Challenge, 'id'> = {
      ...challengeData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, COLLECTIONS.CHALLENGES), {
      ...challenge,
      startDate: dateToTimestamp(challenge.startDate),
      endDate: challenge.endDate ? dateToTimestamp(challenge.endDate) : null,
      createdAt: dateToTimestamp(challenge.createdAt),
      updatedAt: dateToTimestamp(challenge.updatedAt),
    });
    
    return docRef.id;
  },

  async updateChallenge(id: string, updates: Partial<Challenge>) {
    const challengeRef = doc(db, COLLECTIONS.CHALLENGES, id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      ...updates,
      updatedAt: dateToTimestamp(new Date()),
    };
    
    if (updates.startDate) {
      updateData.startDate = dateToTimestamp(updates.startDate);
    }
    
    if (updates.endDate) {
      updateData.endDate = dateToTimestamp(updates.endDate);
    }
    
    await updateDoc(challengeRef, updateData);
  },
};

// Achievement operations
export const achievementService = {
  async getAchievements(): Promise<Achievement[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.ACHIEVEMENTS));
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        unlockedAt: data.unlockedAt ? timestampToDate(data.unlockedAt) : undefined,
      } as Achievement;
    });
  },

  async unlockAchievement(achievementId: string) {
    const achievementRef = doc(db, COLLECTIONS.ACHIEVEMENTS, achievementId);
    await updateDoc(achievementRef, {
      unlocked: true,
      unlockedAt: dateToTimestamp(new Date()),
    });
  },

  async initializeAchievements(achievements: Omit<Achievement, 'id'>[]) {
    const batch = writeBatch(db);
    
    achievements.forEach((achievement) => {
      const achievementRef = doc(collection(db, COLLECTIONS.ACHIEVEMENTS));
      batch.set(achievementRef, {
        ...achievement,
        unlockedAt: achievement.unlockedAt ? dateToTimestamp(achievement.unlockedAt) : null,
      });
    });
    
    await batch.commit();
  },

  subscribeToAchievements(callback: (achievements: Achievement[]) => void) {
    return onSnapshot(collection(db, COLLECTIONS.ACHIEVEMENTS), (snapshot) => {
      const achievements = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          unlockedAt: data.unlockedAt ? timestampToDate(data.unlockedAt) : undefined,
        } as Achievement;
      });
      
      callback(achievements);
    });
  },
};