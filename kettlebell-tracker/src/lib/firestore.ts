import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
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
  // Create new workout with rounds (denormalized - rounds stored in workout document)
  async createWorkout(workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, user: User) {
    // Store rounds directly in workout document for performance
    const workoutRef = doc(collection(db, COLLECTIONS.WORKOUTS));
    const workout: Omit<Workout, 'id'> = {
      ...workoutData,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Convert dates to timestamps for Firestore
    const firestoreData = {
      ...workout,
      date: dateToTimestamp(workout.date),
      createdAt: dateToTimestamp(workout.createdAt),
      updatedAt: dateToTimestamp(workout.updatedAt),
      // Rounds are now stored directly in the workout document
      rounds: workoutData.rounds.map(round => ({
        ...round,
        createdAt: dateToTimestamp(new Date()),
      }))
    };
    
    await setDoc(workoutRef, firestoreData);
    return workoutRef.id;
  },

  // Get workout by ID (optimized - no separate rounds query)
  async getWorkout(id: string): Promise<Workout | null> {
    const workoutDoc = await getDoc(doc(db, COLLECTIONS.WORKOUTS, id));
    if (!workoutDoc.exists()) return null;
    
    const data = workoutDoc.data();
    
    // Check if rounds are stored in document (new format) or need to be fetched separately (legacy)
    let rounds;
    if (data.rounds && Array.isArray(data.rounds)) {
      // New format: rounds stored directly in document
      rounds = data.rounds.map((round: any) => ({
        ...round,
        createdAt: round.createdAt ? timestampToDate(round.createdAt) : new Date(),
      }));
    } else {
      // Legacy format: fetch rounds separately (for existing data)
      rounds = await this.getWorkoutRounds(id);
    }
    
    return {
      id: workoutDoc.id,
      ...data,
      date: timestampToDate(data.date),
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
      rounds,
    } as Workout;
  },

  // Get all workouts (OPTIMIZED - no N+1 queries!)
  async getWorkouts(user: User, limitCount?: number): Promise<Workout[]> {
    let q = query(
      collection(db, COLLECTIONS.WORKOUTS),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    const snapshot = await getDocs(q);
    
    // Process documents efficiently - no additional queries needed!
    const workouts = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Handle both new (denormalized) and legacy (normalized) formats
      let rounds;
      if (data.rounds && Array.isArray(data.rounds)) {
        // New format: rounds stored directly in document
        rounds = data.rounds.map((round: any) => ({
          ...round,
          createdAt: round.createdAt ? timestampToDate(round.createdAt) : new Date(),
        }));
      } else {
        // Legacy format: empty rounds array (will be migrated eventually)
        rounds = [];
      }
      
      return {
        id: doc.id,
        ...data,
        date: timestampToDate(data.date),
        createdAt: timestampToDate(data.createdAt),
        updatedAt: timestampToDate(data.updatedAt),
        rounds,
      } as Workout;
    });
    
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

  // Update workout (supports denormalized rounds)
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
    
    // Handle rounds if provided (for denormalized structure)
    if (updates.rounds) {
      updateData.rounds = updates.rounds.map(round => ({
        ...round,
        createdAt: round.createdAt ? dateToTimestamp(round.createdAt) : dateToTimestamp(new Date()),
      }));
    }
    
    await updateDoc(workoutRef, updateData);
  },

  // Delete workout (handles both denormalized and legacy formats)
  async deleteWorkout(id: string) {
    const batch = writeBatch(db);
    
    // Delete workout document (rounds are included for denormalized format)
    batch.delete(doc(db, COLLECTIONS.WORKOUTS, id));
    
    // For legacy format: also delete separate round documents if they exist
    try {
      const rounds = await this.getWorkoutRounds(id);
      rounds.forEach((round) => {
        batch.delete(doc(db, COLLECTIONS.WORKOUT_ROUNDS, round.id));
      });
    } catch (error) {
      // If no separate rounds exist, that's fine (denormalized format)
      console.log('No separate round documents to delete (using denormalized format)');
    }
    
    await batch.commit();
  },

  // Subscribe to workouts (real-time) - OPTIMIZED: no N+1 queries!
  subscribeToWorkouts(user: User, callback: (workouts: Workout[]) => void, limitCount?: number) {
    let q = query(
      collection(db, COLLECTIONS.WORKOUTS),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    
    if (limitCount) {
      q = query(q, limit(limitCount));
    }
    
    return onSnapshot(q, (snapshot) => {
      // Process documents synchronously - no additional queries!
      const workouts = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Handle both new (denormalized) and legacy (normalized) formats
        let rounds;
        if (data.rounds && Array.isArray(data.rounds)) {
          // New format: rounds stored directly in document
          rounds = data.rounds.map((round: any) => ({
            ...round,
            createdAt: round.createdAt ? timestampToDate(round.createdAt) : new Date(),
          }));
        } else {
          // Legacy format: empty rounds array (will be migrated eventually)
          rounds = [];
        }
        
        return {
          id: doc.id,
          ...data,
          date: timestampToDate(data.date),
          createdAt: timestampToDate(data.createdAt),
          updatedAt: timestampToDate(data.updatedAt),
          rounds,
        } as Workout;
      });
      
      callback(workouts);
    });
  },
};

// User settings operations
export const settingsService = {
  async getUserSettings(user: User): Promise<UserSettings | null> {
    const q = query(
      collection(db, COLLECTIONS.USER_SETTINGS),
      where('userId', '==', user.uid),
      limit(1)
    );
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

  async updateUserSettings(user: User, settings: Partial<UserSettings>) {
    const existing = await this.getUserSettings(user);
    
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
        userId: user.uid,
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
  async getCurrentChallenge(user: User): Promise<Challenge | null> {
    const q = query(
      collection(db, COLLECTIONS.CHALLENGES),
      where('userId', '==', user.uid),
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

  async createChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt' | 'updatedAt' | 'userId'>, user: User) {
    const challenge: Omit<Challenge, 'id'> = {
      ...challengeData,
      userId: user.uid,
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
  async getAchievements(user: User): Promise<Achievement[]> {
    const q = query(
      collection(db, COLLECTIONS.ACHIEVEMENTS),
      where('userId', '==', user.uid)
    );
    const snapshot = await getDocs(q);
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

  async initializeAchievements(achievements: Omit<Achievement, 'id' | 'userId'>[], user: User) {
    const batch = writeBatch(db);
    
    achievements.forEach((achievement) => {
      const achievementRef = doc(collection(db, COLLECTIONS.ACHIEVEMENTS));
      batch.set(achievementRef, {
        ...achievement,
        userId: user.uid,
        unlockedAt: achievement.unlockedAt ? dateToTimestamp(achievement.unlockedAt) : null,
      });
    });
    
    await batch.commit();
  },

  subscribeToAchievements(user: User, callback: (achievements: Achievement[]) => void) {
    const q = query(
      collection(db, COLLECTIONS.ACHIEVEMENTS),
      where('userId', '==', user.uid)
    );
    return onSnapshot(q, (snapshot) => {
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