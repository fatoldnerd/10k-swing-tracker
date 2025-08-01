'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSharedWorkoutData } from '@/hooks/useFirestore';

export function RecentWorkoutsSection() {
  const { recentWorkouts: workouts, loading } = useSharedWorkoutData(); // Use shared data

  if (loading) {
    return (
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="w-5 h-5" />
            Recent Workouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-6 bg-white/10 rounded animate-pulse" />
                  <div className="space-y-1">
                    <div className="w-24 h-5 bg-white/10 rounded animate-pulse" />
                    <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse" />
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
          <History className="w-5 h-5" />
          Recent Workouts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {workouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-white/60 mb-4">No workouts yet</div>
            <Link href="/workout">
              <Button className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600">
                Start Your First Workout
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.slice(0, 3).map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={workout.completed ? "default" : "secondary"}
                    className={workout.completed ? "bg-green-500" : "bg-gray-500"}
                  >
                    {workout.completed ? "Completed" : "In Progress"}
                  </Badge>
                  <div>
                    <div className="text-white font-medium">{workout.strengthExercise}</div>
                    <div className="text-white/60 text-sm">
                      {format(workout.date, 'MMM d, yyyy')} • {workout.kettlebellWeight}kg
                    </div>
                  </div>
                </div>
                <div className="text-white/80">
                  {workout.totalTimeMinutes > 0 ? `${workout.totalTimeMinutes}:${workout.totalTimeSeconds.toString().padStart(2, '0')}` : '--'}
                </div>
              </div>
            ))}
            
            {workouts.length > 3 && (
              <div className="text-center pt-4">
                <Link href="/history">
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    View All Workouts
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}