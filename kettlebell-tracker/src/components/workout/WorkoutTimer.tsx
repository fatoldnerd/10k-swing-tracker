'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkouts } from '@/hooks/useFirestore';
import { ROUND_STRUCTURES, STRENGTH_EXERCISES, KETTLEBELL_WEIGHTS, StrengthExercise, WorkoutRound, Workout } from '@/types';
import { 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  Dumbbell, 
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type TimerState = 'setup' | 'ready' | 'swings' | 'strength' | 'rest' | 'completed' | 'paused';

interface WorkoutTimerState {
  currentRound: number;
  state: TimerState;
  timeRemaining: number;
  totalTime: number;
  roundTimes: number[];
  strengthExercise: StrengthExercise;
  kettlebellWeight: number;
  isRunning: boolean;
}

const SWING_TIME = 30; // 30 seconds per 10 swings (rough estimate)
const STRENGTH_TIME = 60; // 60 seconds for strength exercises
const REST_TIME = 30; // 30 seconds rest between rounds

export default function WorkoutTimer() {
  const router = useRouter();
  const { createWorkout } = useWorkouts();

  const [timerState, setTimerState] = useState<WorkoutTimerState>({
    currentRound: 1,
    state: 'setup',
    timeRemaining: 0,
    totalTime: 0,
    roundTimes: [],
    strengthExercise: 'Push-ups',
    kettlebellWeight: 16,
    isRunning: false,
  });

  const [roundStartTime, setRoundStartTime] = useState<number>(0);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentRoundStructure = useCallback(() => {
    return ROUND_STRUCTURES[timerState.currentRound - 1];
  }, [timerState.currentRound]);

  const handleRoundComplete = useCallback(() => {
    const roundTime = Math.floor((Date.now() - roundStartTime) / 1000);
    const newRoundTimes = [...timerState.roundTimes, roundTime];

    if (timerState.currentRound >= 4) {
      // Workout complete
      setTimerState(prev => ({
        ...prev,
        state: 'completed',
        isRunning: false,
        roundTimes: newRoundTimes,
      }));
    } else {
      // Move to next round
      setTimerState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        state: 'ready',
        timeRemaining: 0,
        isRunning: false,
        roundTimes: newRoundTimes,
      }));
    }
  }, [timerState.currentRound, timerState.roundTimes, roundStartTime]);

  const handlePhaseComplete = useCallback(() => {
    const currentStructure = getCurrentRoundStructure();
    
    if (timerState.state === 'swings') {
      // Move to strength exercise (if any for this round)
      if (currentStructure.strengthReps > 0) {
        setTimerState(prev => ({
          ...prev,
          state: 'strength',
          timeRemaining: STRENGTH_TIME,
        }));
      } else {
        // Skip strength, go to rest or next round
        handleRoundComplete();
      }
    } else if (timerState.state === 'strength') {
      // Move to rest period
      setTimerState(prev => ({
        ...prev,
        state: 'rest',
        timeRemaining: REST_TIME,
      }));
    } else if (timerState.state === 'rest') {
      handleRoundComplete();
    }
  }, [timerState.state, getCurrentRoundStructure, handleRoundComplete]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerState.isRunning && timerState.timeRemaining > 0) {
      interval = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
          totalTime: prev.totalTime + 1,
        }));
      }, 1000);
    } else if (timerState.isRunning && timerState.timeRemaining === 0) {
      // Auto-advance to next phase
      handlePhaseComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState.isRunning, timerState.timeRemaining, handlePhaseComplete]);

  const startWorkout = () => {
    setTimerState(prev => ({
      ...prev,
      state: 'ready',
      totalTime: 0,
      roundTimes: [],
    }));
  };

  const startRound = () => {
    setRoundStartTime(Date.now());
    const swingTime = Math.ceil(getCurrentRoundStructure().swings / 10) * SWING_TIME;
    
    setTimerState(prev => ({
      ...prev,
      state: 'swings',
      timeRemaining: swingTime,
      isRunning: true,
    }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isRunning: false,
      state: prev.state === 'paused' ? 'swings' : 'paused',
    }));
  };

  const stopWorkout = () => {
    setTimerState({
      currentRound: 1,
      state: 'setup',
      timeRemaining: 0,
      totalTime: 0,
      roundTimes: [],
      strengthExercise: timerState.strengthExercise,
      kettlebellWeight: timerState.kettlebellWeight,
      isRunning: false,
    });
  };

  const skipPhase = () => {
    setTimerState(prev => ({
      ...prev,
      timeRemaining: 0,
    }));
  };

  const saveWorkout = async () => {
    try {
      const roundData: WorkoutRound[] = timerState.roundTimes.map((time, index) => ({
        id: '', // Will be generated by Firestore
        workoutId: '', // Will be set by the service
        roundNumber: index + 1,
        timeMinutes: Math.floor(time / 60),
        timeSeconds: time % 60,
        createdAt: new Date(), // Will be set by the service
      }));

      const workoutData: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'> = {
        date: new Date(),
        strengthExercise: timerState.strengthExercise,
        kettlebellWeight: timerState.kettlebellWeight,
        totalTimeMinutes: Math.floor(timerState.totalTime / 60),
        totalTimeSeconds: timerState.totalTime % 60,
        completed: true,
        rounds: roundData,
      };

      await createWorkout(workoutData);
      router.push('/');
    } catch (error) {
      console.error('Failed to save workout:', error);
    }
  };

  const currentStructure = getCurrentRoundStructure();
  const workoutProgress = ((timerState.currentRound - 1) / 4) * 100;

  if (timerState.state === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">Start Workout</h1>
          <p className="text-white/80">Configure your 100-swing session</p>
        </div>

        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5" />
              Workout Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-white font-medium">Strength Exercise</label>
              <Select
                value={timerState.strengthExercise}
                onValueChange={(value: StrengthExercise) => 
                  setTimerState(prev => ({ ...prev, strengthExercise: value }))
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STRENGTH_EXERCISES.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Kettlebell Weight</label>
              <Select
                value={timerState.kettlebellWeight.toString()}
                onValueChange={(value) => 
                  setTimerState(prev => ({ ...prev, kettlebellWeight: parseInt(value) }))
                }
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KETTLEBELL_WEIGHTS.map((weight) => (
                    <SelectItem key={weight} value={weight.toString()}>
                      {weight}kg
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border border-white/20 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-semibold">Workout Structure</h3>
              <div className="space-y-2">
                {ROUND_STRUCTURES.map((round, index) => (
                  <div key={index} className="flex justify-between text-sm text-white/80">
                    <span>Round {round.roundNumber}</span>
                    <span>
                      {round.swings} swings
                      {round.strengthReps > 0 && ` + ${round.strengthReps} ${timerState.strengthExercise.toLowerCase()}`}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-center text-white font-medium pt-2 border-t border-white/20">
                Total: 100 swings
              </div>
            </div>

            <Button 
              onClick={startWorkout}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-semibold py-3"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (timerState.state === 'completed') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white">Workout Complete!</h1>
          <p className="text-white/80">Great job! You completed all 100 swings.</p>
        </div>

        <Card className="glass border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Workout Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{formatTime(timerState.totalTime)}</div>
                <div className="text-white/60">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{timerState.kettlebellWeight}kg</div>
                <div className="text-white/60">Weight Used</div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-semibold">Round Times</h3>
              {timerState.roundTimes.map((time, index) => (
                <div key={index} className="flex justify-between text-white/80">
                  <span>Round {index + 1}</span>
                  <span>{formatTime(time)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={saveWorkout}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600"
              >
                Save Workout
              </Button>
              <Button 
                onClick={stopWorkout}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Start New
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-white">
          Round {timerState.currentRound} of 4
        </h1>
        <Progress value={workoutProgress} className="h-2 max-w-md mx-auto" />
      </div>

      {/* Timer Display */}
      <Card className="glass border-white/20 timer-bg">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="text-8xl font-bold text-white">
              {timerState.state === 'ready' ? '--:--' : formatTime(timerState.timeRemaining)}
            </div>
            
            <div className="space-y-2">
              <Badge 
                className={`text-lg px-4 py-2 ${
                  timerState.state === 'swings' 
                    ? 'bg-blue-500' 
                    : timerState.state === 'strength'
                    ? 'bg-orange-500'
                    : timerState.state === 'rest'
                    ? 'bg-green-500'
                    : 'bg-gray-500'
                }`}
              >
                {timerState.state === 'ready' && 'Ready to Start'}
                {timerState.state === 'swings' && `${currentStructure.swings} Kettlebell Swings`}
                {timerState.state === 'strength' && `${currentStructure.strengthReps} ${timerState.strengthExercise}`}
                {timerState.state === 'rest' && 'Rest Period'}
                {timerState.state === 'paused' && 'Paused'}
              </Badge>
              
              <div className="text-white/80">
                Total Time: {formatTime(timerState.totalTime)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card className="glass border-white/20">
        <CardContent className="p-6">
          <div className="flex justify-center gap-4">
            {timerState.state === 'ready' && (
              <Button 
                onClick={startRound}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Round
              </Button>
            )}
            
            {(timerState.state === 'swings' || timerState.state === 'strength' || timerState.state === 'rest') && (
              <>
                <Button 
                  onClick={pauseTimer}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
                >
                  {timerState.isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {timerState.isRunning ? 'Pause' : 'Resume'}
                </Button>
                
                <Button 
                  onClick={skipPhase}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-3"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Skip
                </Button>
              </>
            )}
            
            <Button 
              onClick={stopWorkout}
              variant="destructive"
              className="px-8 py-3"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Round Progress */}
      <div className="grid grid-cols-4 gap-4">
        {ROUND_STRUCTURES.map((round, index) => (
          <Card 
            key={index} 
            className={`glass border-white/20 ${
              index + 1 < timerState.currentRound 
                ? 'bg-green-500/20' 
                : index + 1 === timerState.currentRound 
                ? 'bg-blue-500/20' 
                : 'bg-white/5'
            }`}
          >
            <CardContent className="p-4 text-center">
              <div className="text-white font-semibold">R{round.roundNumber}</div>
              <div className="text-sm text-white/80">{round.swings} swings</div>
              {round.strengthReps > 0 && (
                <div className="text-xs text-white/60">{round.strengthReps} strength</div>
              )}
              {timerState.roundTimes[index] && (
                <div className="text-xs text-green-400 mt-1">
                  {formatTime(timerState.roundTimes[index])}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}