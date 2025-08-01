'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';
import { useProgressStats } from '@/hooks/useFirestore';

export function ProgressSection() {
  const { stats, loading } = useProgressStats();

  if (loading) {
    return (
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5" />
            Challenge Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/80">
              <span>Loading...</span>
              <div className="w-8 h-4 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="h-3 bg-white/10 rounded animate-pulse" />
            <div className="text-center">
              <div className="w-24 h-6 bg-white/10 rounded mx-auto animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <div className="w-16 h-8 bg-white/10 rounded mx-auto animate-pulse" />
                <div className="w-20 h-4 bg-white/10 rounded mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5" />
          Challenge Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/80">
            <span>Workouts Completed</span>
            <span>{stats.completedWorkouts} / 20</span>
          </div>
          <Progress value={stats.progressPercentage} className="h-3" />
          <div className="text-center text-lg font-semibold text-white">
            {stats.progressPercentage.toFixed(1)}% Complete
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-white">{stats.totalSwings.toLocaleString()}</div>
            <div className="text-sm text-white/60">Total Swings</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-white">{stats.remainingWorkouts}</div>
            <div className="text-sm text-white/60">Remaining</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-white">
              {stats.averageTime > 0 ? `${stats.averageTime.toFixed(1)}m` : '--'}
            </div>
            <div className="text-sm text-white/60">Avg Time</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-white">{stats.consecutiveDays}</div>
            <div className="text-sm text-white/60">Day Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}