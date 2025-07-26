'use client';

import { useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAchievements, useWorkouts, useProgressStats } from '@/hooks/useFirestore';
import { Achievement as AchievementType } from '@/types';
import { Trophy, Lock, CheckCircle, Target, Star } from 'lucide-react';
import { format } from 'date-fns';

export default function Achievements() {
  const { achievements, loading: achievementsLoading, initializeAchievements, unlockAchievement } = useAchievements();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { stats } = useProgressStats();

  const loading = achievementsLoading || workoutsLoading;
  const completedWorkouts = workouts.filter(w => w.completed);

  // Initialize achievements on mount
  useEffect(() => {
    initializeAchievements().catch(console.error);
  }, [initializeAchievements]);

  // Check and unlock achievements based on current progress
  useEffect(() => {
    if (loading || achievements.length === 0 || completedWorkouts.length === 0) return;

    const checkAchievements = async () => {
      for (const achievement of achievements) {
        if (achievement.unlocked) continue;

        let shouldUnlock = false;

        switch (achievement.criteria.type) {
          case 'workouts_completed':
            shouldUnlock = completedWorkouts.length >= achievement.criteria.value;
            break;

          case 'time_under':
            const fastWorkouts = completedWorkouts.filter(w => {
              const totalMinutes = w.totalTimeMinutes + w.totalTimeSeconds / 60;
              return totalMinutes < achievement.criteria.value;
            });
            shouldUnlock = fastWorkouts.length > 0;
            break;

          case 'consecutive_days':
            shouldUnlock = stats.consecutiveDays >= achievement.criteria.value;
            break;

          case 'weekly_count':
            shouldUnlock = stats.weeklyWorkouts >= achievement.criteria.value;
            break;

          case 'total_swings':
            shouldUnlock = stats.totalSwings >= achievement.criteria.value;
            break;

          case 'exercise_variety':
            const uniqueExercises = new Set(completedWorkouts.map(w => w.strengthExercise));
            shouldUnlock = uniqueExercises.size >= achievement.criteria.value;
            break;

          case 'challenge_complete':
            shouldUnlock = completedWorkouts.length >= 20;
            break;
        }

        if (shouldUnlock) {
          try {
            await unlockAchievement(achievement.id);
          } catch (error) {
            console.error('Failed to unlock achievement:', error);
          }
        }
      }
    };

    checkAchievements();
  }, [achievements, completedWorkouts, stats, unlockAchievement, loading]);

  // Calculate progress for each achievement
  const achievementsWithProgress = useMemo(() => {
    return achievements.map(achievement => {
      let progress = 0;
      let currentValue = 0;
      let description = achievement.description;

      if (achievement.unlocked) {
        progress = 100;
        currentValue = achievement.criteria.value;
      } else {
        switch (achievement.criteria.type) {
          case 'workouts_completed':
            currentValue = completedWorkouts.length;
            progress = Math.min((currentValue / achievement.criteria.value) * 100, 100);
            description = `Complete ${achievement.criteria.value} workouts (${currentValue}/${achievement.criteria.value})`;
            break;

          case 'time_under':
            const fastWorkouts = completedWorkouts.filter(w => {
              const totalMinutes = w.totalTimeMinutes + w.totalTimeSeconds / 60;
              return totalMinutes < achievement.criteria.value;
            });
            currentValue = fastWorkouts.length;
            progress = currentValue > 0 ? 100 : 0;
            description = `Complete a workout under ${achievement.criteria.value} minutes`;
            break;

          case 'consecutive_days':
            currentValue = stats.consecutiveDays;
            progress = Math.min((currentValue / achievement.criteria.value) * 100, 100);
            description = `Complete workouts on ${achievement.criteria.value} consecutive days (${currentValue}/${achievement.criteria.value})`;
            break;

          case 'weekly_count':
            currentValue = stats.weeklyWorkouts;
            progress = Math.min((currentValue / achievement.criteria.value) * 100, 100);
            description = `Complete ${achievement.criteria.value} workouts in one week (${currentValue}/${achievement.criteria.value})`;
            break;

          case 'total_swings':
            currentValue = stats.totalSwings;
            progress = Math.min((currentValue / achievement.criteria.value) * 100, 100);
            description = `Complete ${achievement.criteria.value.toLocaleString()} total swings (${currentValue.toLocaleString()}/${achievement.criteria.value.toLocaleString()})`;
            break;

          case 'exercise_variety':
            const uniqueExercises = new Set(completedWorkouts.map(w => w.strengthExercise));
            currentValue = uniqueExercises.size;
            progress = Math.min((currentValue / achievement.criteria.value) * 100, 100);
            description = `Try all ${achievement.criteria.value} different strength exercises (${currentValue}/${achievement.criteria.value})`;
            break;

          case 'challenge_complete':
            currentValue = completedWorkouts.length;
            progress = Math.min((currentValue / 20) * 100, 100);
            description = `Complete the full 20-workout challenge (${currentValue}/20)`;
            break;
        }
      }

      return {
        ...achievement,
        progress,
        currentValue,
        description,
      };
    });
  }, [achievements, completedWorkouts, stats]);

  const unlockedAchievements = achievementsWithProgress.filter(a => a.unlocked);
  const inProgressAchievements = achievementsWithProgress.filter(a => !a.unlocked && a.progress > 0);
  const lockedAchievements = achievementsWithProgress.filter(a => !a.unlocked && a.progress === 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Loading Achievements...</h1>
          <div className="w-16 h-16 mx-auto border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Achievements</h1>
        <p className="text-white/80">Track your progress and unlock new badges</p>
      </div>

      {/* Progress Overview */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-yellow-400">{unlockedAchievements.length}</div>
              <div className="text-white/60">Unlocked</div>
              <Progress value={(unlockedAchievements.length / achievements.length) * 100} className="h-2" />
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-400">{inProgressAchievements.length}</div>
              <div className="text-white/60">In Progress</div>
              <Progress value={(inProgressAchievements.length / achievements.length) * 100} className="h-2 bg-blue-500/20" />
            </div>
            
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-gray-400">{lockedAchievements.length}</div>
              <div className="text-white/60">Locked</div>
              <Progress value={(lockedAchievements.length / achievements.length) * 100} className="h-2 bg-gray-500/20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recently Unlocked */}
      {unlockedAchievements.length > 0 && (
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              Recently Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unlockedAchievements
                .sort((a, b) => (b.unlockedAt?.getTime() || 0) - (a.unlockedAt?.getTime() || 0))
                .slice(0, 6)
                .map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <div className="text-white font-medium">{achievement.name}</div>
                      <div className="text-yellow-400 text-sm">
                        {achievement.unlockedAt && format(achievement.unlockedAt, 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievement Categories */}
      <div className="space-y-6">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Unlocked Achievements ({unlockedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Progress Achievements */}
        {inProgressAchievements.length > 0 && (
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-400" />
                In Progress ({inProgressAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressAchievements
                  .sort((a, b) => b.progress - a.progress)
                  .map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-400" />
                Locked Achievements ({lockedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lockedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Achievement card component
function AchievementCard({ achievement }: { achievement: AchievementType & { progress: number; currentValue: number; description: string } }) {
  const isUnlocked = achievement.unlocked;
  const isInProgress = !isUnlocked && achievement.progress > 0;

  return (
    <div className={`p-4 rounded-lg border transition-all ${
      isUnlocked 
        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
        : isInProgress
        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/50'
        : 'bg-white/5 border-white/20'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>
          {achievement.icon}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold">{achievement.name}</h3>
            {isUnlocked && (
              <Badge className="bg-green-500/20 text-green-400 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Unlocked
              </Badge>
            )}
          </div>
          
          <p className={`text-sm ${isUnlocked ? 'text-white/80' : 'text-white/60'}`}>
            {achievement.description}
          </p>
          
          {!isUnlocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Progress</span>
                <span>{Math.round(achievement.progress)}%</span>
              </div>
              <Progress value={achievement.progress} className="h-2" />
            </div>
          )}
          
          {isUnlocked && achievement.unlockedAt && (
            <div className="text-xs text-yellow-400">
              Unlocked on {format(achievement.unlockedAt, 'MMM d, yyyy')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}