'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, Flame, TrendingUp } from 'lucide-react';
import { useProgressStats } from '@/hooks/useFirestore';

export function QuickStatsSection() {
  const { stats, loading } = useProgressStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass border-white/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse" />
                <div className="space-y-2">
                  <div className="w-16 h-8 bg-white/10 rounded animate-pulse" />
                  <div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
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
  );
}