'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Timer, 
  Plus, 
  History, 
  BarChart3, 
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { ProgressSection } from './ProgressSection';
import { QuickStatsSection } from './QuickStatsSection';
import { RecentWorkoutsSection } from './RecentWorkoutsSection';
import { RecentAchievementsSection } from './RecentAchievementsSection';

export default function Dashboard() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">10K Swing Challenge</h1>
        <p className="text-white/80">Track your progress toward 10,000 kettlebell swings</p>
      </div>

      {/* Progress Overview - Loads independently */}
      <ProgressSection />

      {/* Quick Stats - Loads independently */}
      <QuickStatsSection />

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

      {/* Recent Workouts - Loads independently */}
      <RecentWorkoutsSection />

      {/* Recent Achievements - Loads independently */}
      <RecentAchievementsSection />
    </div>
  );
}