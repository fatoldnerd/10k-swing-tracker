import WorkoutLogger from '@/components/log/WorkoutLogger';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function LogPage() {
  return (
    <ProtectedRoute>
      <WorkoutLogger />
    </ProtectedRoute>
  );
}