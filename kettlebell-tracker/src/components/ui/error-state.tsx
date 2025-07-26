import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Wifi, Database } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: 'general' | 'network' | 'firebase' | 'notfound';
}

export function ErrorState({ 
  title, 
  message, 
  onRetry, 
  type = 'general' 
}: ErrorStateProps) {
  const getErrorConfig = () => {
    switch (type) {
      case 'network':
        return {
          icon: Wifi,
          defaultTitle: 'Connection Error',
          defaultMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
          color: 'text-orange-400'
        };
      case 'firebase':
        return {
          icon: Database,
          defaultTitle: 'Database Error',
          defaultMessage: 'Unable to connect to the database. Please try again in a moment.',
          color: 'text-red-400'
        };
      case 'notfound':
        return {
          icon: AlertTriangle,
          defaultTitle: 'Not Found',
          defaultMessage: 'The requested resource could not be found.',
          color: 'text-yellow-400'
        };
      default:
        return {
          icon: AlertTriangle,
          defaultTitle: 'Something went wrong',
          defaultMessage: 'An unexpected error occurred. Please try again.',
          color: 'text-red-400'
        };
    }
  };

  const config = getErrorConfig();
  const Icon = config.icon;

  return (
    <Card className="glass border-white/20 max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          {title || config.defaultTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/80">
          {message || config.defaultMessage}
        </p>
        
        {onRetry && (
          <Button
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function PageErrorState(props: ErrorStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorState {...props} />
    </div>
  );
}