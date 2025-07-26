import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'border-2 border-white/20 border-t-white rounded-full animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4 p-8', className)}>
      <LoadingSpinner size="lg" />
      <p className="text-white/80 text-lg">{message}</p>
    </div>
  );
}

export function PageLoadingState({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState message={message} />
    </div>
  );
}