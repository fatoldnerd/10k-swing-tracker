'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProgressStats, useWorkouts, useAchievements } from '@/hooks/useFirestore';
import { 
  Timer, 
  Plus, 
  History, 
  BarChart3, 
  Trophy,
  Target,
  Clock,
  Flame,
  Award,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function Dashboard() {
  const { stats, loading: statsLoading } = useProgressStats();
  const { workouts, loading: workoutsLoading } = useWorkouts(5); // Get last 5 workouts
  const { achievements, initializeAchievements, loading: achievementsLoading } = useAchievements();

  // Initialize achievements on first load
  useEffect(() => {
    initializeAchievements().catch(console.error);
  }, [initializeAchievements]);

  const loading = statsLoading || workoutsLoading || achievementsLoading;

  const recentAchievements = achievements.filter(a => a.unlocked).slice(-3);
  const navigationCards = [
    {
      title: 'Start Workout',
      description: 'Begin your 100-swing session',
      icon: Timer,
      href: '/workout',
      gradient: 'from-blue-400 to-cyan-500',
    },
    {
      title: 'Log Workout',
      description: 'Manually add completed workout',
      icon: Plus,
      href: '/log',
      gradient: 'from-green-400 to-emerald-500',
    },
    {
      title: 'View History',
      description: 'See all your workouts',
      icon: History,
      href: '/history',
      gradient: 'from-purple-400 to-pink-500',
    },
    {
      title: 'Analytics',
      description: 'Track your progress',
      icon: BarChart3,
      href: '/analytics',
      gradient: 'from-orange-400 to-red-500',
    },
    {
      title: 'Achievements',
      description: 'View your badges',
      icon: Trophy,
      href: '/achievements',
      gradient: 'from-yellow-400 to-amber-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Loading Dashboard...</h1>
          <div className="w-16 h-16 mx-auto border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">10K Swing Challenge</h1>
        <p className="text-white/80">Track your progress toward 10,000 kettlebell swings</p>
      </div>

      {/* Progress Overview */}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.bestTime > 0 ? `${stats.bestTime.toFixed(1)}m` : '--'}
                </div>
                <div className="text-white/60">Best Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.weeklyWorkouts}</div>
                <div className="text-white/60">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.exerciseVariety}</div>
                <div className="text-white/60">Exercise Types</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {navigationCards.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <Card className="glass border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${item.gradient} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{item.title}</div>
                      <div className="text-white/60 text-sm">{item.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Recent Workouts */}
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

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentAchievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="text-white font-medium">{achievement.name}</div>
                    <div className="text-white/60 text-sm">{achievement.description}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center pt-4">
              <Link href="/achievements">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  View All Achievements
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}