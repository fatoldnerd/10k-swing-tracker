import WorkoutHistory from '@/components/history/WorkoutHistory';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <WorkoutHistory />
    </ProtectedRoute>
  );
}