'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkouts, useProgressStats } from '@/hooks/useFirestore';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy, 
  Clock,
  Target,
  Flame,
  Calendar,
  Award
} from 'lucide-react';
import { format, startOfWeek, eachWeekOfInterval, subWeeks, subMonths } from 'date-fns';

type TimeRange = '7days' | '30days' | '90days' | 'all';

export default function Analytics() {
  const { workouts, loading } = useWorkouts();
  const { stats } = useProgressStats();
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');

  const completedWorkouts = useMemo(() => {
    return workouts.filter(w => w.completed);
  }, [workouts]);

  // Filter workouts by time range
  const filteredWorkouts = useMemo(() => {
    if (timeRange === 'all') return completedWorkouts;
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '7days':
        cutoffDate = subWeeks(now, 1);
        break;
      case '30days':
        cutoffDate = subMonths(now, 1);
        break;
      case '90days':
        cutoffDate = subMonths(now, 3);
        break;
      default:
        return completedWorkouts;
    }
    
    return completedWorkouts.filter(workout => workout.date >= cutoffDate);
  }, [completedWorkouts, timeRange]);

  // Performance over time data
  const performanceData = useMemo(() => {
    if (filteredWorkouts.length === 0) return [];
    
    const data = filteredWorkouts
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((workout, index) => ({
        date: format(workout.date, 'MMM dd'),
        fullDate: workout.date,
        time: workout.totalTimeMinutes + workout.totalTimeSeconds / 60,
        workout: index + 1,
        exercise: workout.strengthExercise,
        weight: workout.kettlebellWeight,
      }));
    
    return data;
  }, [filteredWorkouts]);

  // Weekly progress data
  const weeklyData = useMemo(() => {
    if (completedWorkouts.length === 0) return [];
    
    const weeks = eachWeekOfInterval({
      start: subWeeks(new Date(), 12),
      end: new Date()
    });
    
    return weeks.map(week => {
      const weekWorkouts = completedWorkouts.filter(workout => {
        const workoutWeek = startOfWeek(workout.date);
        return workoutWeek.getTime() === week.getTime();
      });
      
      const totalTime = weekWorkouts.reduce((sum, w) => sum + w.totalTimeMinutes + w.totalTimeSeconds / 60, 0);
      
      return {
        week: format(week, 'MMM dd'),
        workouts: weekWorkouts.length,
        totalSwings: weekWorkouts.length * 500,
        avgTime: weekWorkouts.length > 0 ? totalTime / weekWorkouts.length : 0,
        totalTime,
      };
    });
  }, [completedWorkouts]);

  // Exercise distribution data
  const exerciseData = useMemo(() => {
    const exerciseCounts = completedWorkouts.reduce((acc, workout) => {
      acc[workout.strengthExercise] = (acc[workout.strengthExercise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
    
    return Object.entries(exerciseCounts).map(([exercise, count], index) => ({
      name: exercise,
      value: count,
      color: colors[index % colors.length],
    }));
  }, [completedWorkouts]);

  // Weight distribution data
  const weightData = useMemo(() => {
    const weightCounts = completedWorkouts.reduce((acc, workout) => {
      const weight = `${workout.kettlebellWeight}kg`;
      acc[weight] = (acc[weight] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(weightCounts).map(([weight, count]) => ({
      weight,
      count,
    }));
  }, [completedWorkouts]);

  // Personal records
  const personalRecords = useMemo(() => {
    if (completedWorkouts.length === 0) return null;
    
    const times = completedWorkouts.map(w => w.totalTimeMinutes + w.totalTimeSeconds / 60);
    const bestTime = Math.min(...times);
    const bestWorkout = completedWorkouts.find(w => 
      (w.totalTimeMinutes + w.totalTimeSeconds / 60) === bestTime
    );
    
    // Calculate streaks
    const sortedWorkouts = [...completedWorkouts].sort((a, b) => b.date.getTime() - a.date.getTime());
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const currentDate = new Date(sortedWorkouts[i].date);
      currentDate.setHours(0, 0, 0, 0);
      
      if (i === 0) {
        tempStreak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (currentDate.getTime() === today.getTime() || currentDate.getTime() === yesterday.getTime()) {
          currentStreak = 1;
        }
      } else {
        const prevDate = new Date(sortedWorkouts[i - 1].date);
        prevDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
          if (i === 1 && currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
          if (currentStreak === 0) {
            currentStreak = 0;
          }
        }
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    
    return {
      bestTime,
      bestWorkout,
      totalWorkouts: completedWorkouts.length,
      totalSwings: completedWorkouts.length * 500,
      currentStreak,
      maxStreak,
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
    };
  }, [completedWorkouts]);

  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Loading Analytics...</h1>
          <div className="w-16 h-16 mx-auto border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (completedWorkouts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
          <p className="text-white/80">Track your progress and performance insights</p>
        </div>
        
        <Card className="glass border-white/20">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Data Available</h3>
            <p className="text-white/60 mb-4">
              Complete some workouts to see your analytics and progress charts
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Analytics</h1>
          <p className="text-white/80">Track your progress and performance insights</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.completedWorkouts}</div>
                <div className="text-white/60">Total Workouts</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-400 to-cyan-500">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalSwings.toLocaleString()}</div>
                <div className="text-white/60">Total Swings</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {personalRecords ? formatTime(personalRecords.bestTime) : '--'}
                </div>
                <div className="text-white/60">Best Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-gradient-to-r from-purple-400 to-pink-500">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {personalRecords?.currentStreak || 0}
                </div>
                <div className="text-white/60">Current Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Over Time */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                  tickFormatter={(value) => formatTime(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: number) => [formatTime(value), 'Time']}
                />
                <Line 
                  type="monotone" 
                  dataKey="time" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="week" 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="workouts" 
                  stroke="#3B82F6" 
                  fill="url(#colorWorkouts)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Exercise & Weight Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Exercise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={exerciseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {exerciseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: 'white' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Weight Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="weight" 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personal Records */}
      {personalRecords && (
        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              Personal Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-green-400">
                  {formatTime(personalRecords.bestTime)}
                </div>
                <div className="text-white/60">Fastest Workout</div>
                {personalRecords.bestWorkout && (
                  <Badge className="bg-green-500/20 text-green-400">
                    {personalRecords.bestWorkout.strengthExercise} • {personalRecords.bestWorkout.kettlebellWeight}kg
                  </Badge>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-blue-400">
                  {personalRecords.maxStreak}
                </div>
                <div className="text-white/60">Longest Streak</div>
                <Badge className="bg-blue-500/20 text-blue-400">
                  {personalRecords.maxStreak} day{personalRecords.maxStreak !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-purple-400">
                  {formatTime(personalRecords.averageTime)}
                </div>
                <div className="text-white/60">Average Time</div>
                <Badge className="bg-purple-500/20 text-purple-400">
                  Per Workout
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}