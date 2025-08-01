import Achievements from '@/components/achievements/Achievements';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AchievementsPage() {
  return (
    <ProtectedRoute>
      <Achievements />
    </ProtectedRoute>
  );
}