'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';
import Link from 'next/link';
import { useAchievements } from '@/hooks/useFirestore';

export function RecentAchievementsSection() {
  const { achievements, initializeAchievements, loading } = useAchievements();

  // Initialize achievements on first load
  useEffect(() => {
    initializeAchievements().catch(console.error);
  }, [initializeAchievements]);

  const recentAchievements = achievements.filter(a => a.unlocked).slice(-3);

  if (loading) {
    return (
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Award className="w-5 h-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-8 h-8 bg-white/10 rounded animate-pulse" />
                <div className="space-y-1">
                  <div className="w-24 h-5 bg-white/10 rounded animate-pulse" />
                  <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Don't render the section if no achievements are unlocked
  if (recentAchievements.length === 0) {
    return null;
  }

  return (
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
            <Button variant="outline" className="border-gray-600 text-gray-700 hover:bg-gray-100 hover:text-gray-900">
              View All Achievements
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}