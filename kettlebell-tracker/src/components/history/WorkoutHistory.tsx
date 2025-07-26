'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWorkouts } from '@/hooks/useFirestore';
import { Workout, STRENGTH_EXERCISES } from '@/types';
import { 
  History, 
  Filter, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Dumbbell,
  Search,
  CheckCircle,
  Circle
} from 'lucide-react';
import { format } from 'date-fns';

interface FilterState {
  search: string;
  exercise: string;
  completed: string;
  dateFrom: string;
  dateTo: string;
}

export default function WorkoutHistory() {
  const { workouts, loading, error, updateWorkout, deleteWorkout } = useWorkouts();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    exercise: '',
    completed: '',
    dateFrom: '',
    dateTo: '',
  });

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      exercise: '',
      completed: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const filteredWorkouts = workouts.filter(workout => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        workout.strengthExercise.toLowerCase().includes(searchTerm) ||
        workout.notes?.toLowerCase().includes(searchTerm) ||
        workout.kettlebellWeight.toString().includes(searchTerm);
      if (!matchesSearch) return false;
    }

    // Exercise filter
    if (filters.exercise && workout.strengthExercise !== filters.exercise) {
      return false;
    }

    // Completion filter
    if (filters.completed) {
      const isCompleted = filters.completed === 'completed';
      if (workout.completed !== isCompleted) return false;
    }

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      if (workout.date < fromDate) return false;
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59); // End of day
      if (workout.date > toDate) return false;
    }

    return true;
  });

  const formatTime = (minutes: number, seconds: number): string => {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleEdit = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (workout: Workout) => {
    setSelectedWorkout(workout);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateWorkout = async (updates: Partial<Workout>) => {
    if (!selectedWorkout) return;
    
    try {
      await updateWorkout(selectedWorkout.id, updates);
      setIsEditDialogOpen(false);
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Failed to update workout:', error);
      alert('Failed to update workout. Please try again.');
    }
  };

  const handleDeleteWorkout = async () => {
    if (!selectedWorkout) return;
    
    try {
      await deleteWorkout(selectedWorkout.id);
      setIsDeleteDialogOpen(false);
      setSelectedWorkout(null);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('Failed to delete workout. Please try again.');
    }
  };

  const toggleWorkoutCompletion = async (workout: Workout) => {
    try {
      await updateWorkout(workout.id, { completed: !workout.completed });
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Loading History...</h1>
          <div className="w-16 h-16 mx-auto border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Workout History</h1>
          <p className="text-white/80">View and manage all your workout sessions</p>
        </div>
        
        <Card className="glass border-red-500/50">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 text-red-400 mx-auto mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-white mb-2">Connection Error</h3>
            <p className="text-white/60 mb-4">
              Unable to load workout history. This might be due to:
            </p>
            <ul className="text-white/60 text-sm text-left max-w-md mx-auto mb-4">
              <li>• Firebase credentials not configured in .env.local</li>
              <li>• Firestore emulator not running</li>
              <li>• Network connectivity issues</li>
            </ul>
            <p className="text-white/60 text-sm mb-4">
              Error: {error}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">Workout History</h1>
        <p className="text-white/80">View and manage all your workout sessions</p>
      </div>

      {/* Filters */}
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-white text-sm">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <Input
                  placeholder="Search workouts..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="bg-white/10 border-white/20 text-white pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm">Exercise Type</label>
              <Select value={filters.exercise} onValueChange={(value) => updateFilter('exercise', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All exercises" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All exercises</SelectItem>
                  {STRENGTH_EXERCISES.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm">Status</label>
              <Select value={filters.completed} onValueChange={(value) => updateFilter('completed', value)}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="All workouts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All workouts</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="incomplete">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm">From Date</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-white text-sm">To Date</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Clear Filters
              </Button>
            </div>
          </div>

          <div className="text-white/70 text-sm">
            Showing {filteredWorkouts.length} of {workouts.length} workouts
          </div>
        </CardContent>
      </Card>

      {/* Workout List */}
      {filteredWorkouts.length === 0 ? (
        <Card className="glass border-white/20">
          <CardContent className="text-center py-12">
            <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No workouts found</h3>
            <p className="text-white/60 mb-4">
              {workouts.length === 0 
                ? "You haven't logged any workouts yet" 
                : "Try adjusting your filters"}
            </p>
            <Button 
              onClick={() => window.location.href = '/workout'}
              className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600"
            >
              Start Your First Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredWorkouts.map((workout) => (
            <Card key={workout.id} className="glass border-white/20 hover:border-white/40 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleWorkoutCompletion(workout)}
                      className="text-white hover:text-green-400 transition-colors"
                    >
                      {workout.completed ? (
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {workout.strengthExercise}
                        </h3>
                        <Badge 
                          variant={workout.completed ? "default" : "secondary"}
                          className={workout.completed ? "bg-green-500" : "bg-gray-500"}
                        >
                          {workout.completed ? "Completed" : "In Progress"}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(workout.date, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Dumbbell className="w-4 h-4" />
                          {workout.kettlebellWeight}kg
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatTime(workout.totalTimeMinutes, workout.totalTimeSeconds)}
                        </div>
                      </div>
                      
                      {workout.notes && (
                        <div className="text-white/60 text-sm mt-1">
                          &ldquo;{workout.notes}&rdquo;
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleEdit(workout)}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(workout)}
                      variant="outline"
                      size="sm"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Round Details */}
                {workout.rounds.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-4 gap-2">
                      {workout.rounds.map((round) => (
                        <div key={round.roundNumber} className="text-center">
                          <div className="text-white/50 text-xs">R{round.roundNumber}</div>
                          <div className="text-white text-sm">
                            {formatTime(round.timeMinutes, round.timeSeconds)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="glass border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Workout</DialogTitle>
          </DialogHeader>
          {selectedWorkout && (
            <EditWorkoutForm 
              workout={selectedWorkout} 
              onSave={handleUpdateWorkout}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="glass border-white/20 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Workout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-white/80">
              Are you sure you want to delete this workout? This action cannot be undone.
            </p>
            {selectedWorkout && (
              <div className="p-4 border border-white/20 rounded-lg">
                <div className="text-white font-medium">{selectedWorkout.strengthExercise}</div>
                <div className="text-white/60 text-sm">
                  {format(selectedWorkout.date, 'MMM d, yyyy')} • {selectedWorkout.kettlebellWeight}kg
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteWorkout}
                variant="destructive"
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple edit form component
function EditWorkoutForm({ 
  workout, 
  onSave, 
  onCancel 
}: { 
  workout: Workout;
  onSave: (updates: Partial<Workout>) => void;
  onCancel: () => void;
}) {
  const [notes, setNotes] = useState(workout.notes || '');
  const [completed, setCompleted] = useState(workout.completed);

  const handleSave = () => {
    onSave({
      notes: notes || undefined,
      completed,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-white text-sm">Status</label>
        <Select value={completed.toString()} onValueChange={(value) => setCompleted(value === 'true')}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Completed</SelectItem>
            <SelectItem value="false">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-white text-sm">Notes</label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this workout..."
          className="bg-white/10 border-white/20 text-white"
        />
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} className="flex-1 bg-green-500 hover:bg-green-600">
          Save Changes
        </Button>
        <Button 
          onClick={onCancel}
          variant="outline" 
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}