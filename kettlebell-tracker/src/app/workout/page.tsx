import WorkoutTimer from '@/components/workout/WorkoutTimer';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function WorkoutPage() {
  return (
    <ProtectedRoute>
      <WorkoutTimer />
    </ProtectedRoute>
  );
}