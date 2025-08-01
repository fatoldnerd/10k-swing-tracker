'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Dumbbell, Timer, TrendingUp, Users, Eye, EyeOff } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-75 animate-pulse"></div>
      <div className="absolute inset-0 bg-gradient-to-l from-orange-400 via-red-500 to-pink-600 opacity-50 animation-delay-2000 animate-pulse"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="p-6">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">10K Swing Tracker</h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left Side - Landing Content */}
          <div className="flex-1 p-6 lg:p-12 text-white">
            {/* Hero Section */}
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 text-center lg:text-left">
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                  Forge a New You in Just{' '}
                  <span className="text-yellow-300">20 Workouts</span>
                </h1>
                <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                  Join the legendary 10,000 Swing Challenge. Track every rep, monitor your progress, 
                  and witness your transformation. This is more than a workout; it is a test of will. 
                  Are you ready to redefine your limits?
                </p>
              </div>

              {/* What is the Challenge Section */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-4">The Ultimate Strength and Conditioning Journey</h2>
                <p className="text-lg opacity-90 mb-6">
                  Popularized by legendary coach Dan John, the 10,000 Swing Challenge is a proven, 
                  four-week program designed to burn fat, build powerful muscle, and cultivate unshakable mental toughness.
                </p>
                <p className="text-lg opacity-90">
                  Simply complete 10,000 kettlebell swings across 20 targeted workouts. Between swing sets, 
                  perform foundational strength exercises to build a balanced, athletic physique.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <Card className="p-6 backdrop-blur-md bg-white/10 border-white/20">
                  <Timer className="h-8 w-8 text-yellow-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Effortless Logging</h3>
                  <p className="opacity-90">Record workouts in under 30 seconds with our streamlined interface.</p>
                </Card>

                <Card className="p-6 backdrop-blur-md bg-white/10 border-white/20">
                  <TrendingUp className="h-8 w-8 text-yellow-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Dynamic Dashboard</h3>
                  <p className="opacity-90">Real-time overview of total swings, workouts, and tonnage lifted.</p>
                </Card>

                <Card className="p-6 backdrop-blur-md bg-white/10 border-white/20">
                  <Users className="h-8 w-8 text-yellow-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Secure Cloud Storage</h3>
                  <p className="opacity-90">Your data syncs safely across devices so you never lose a rep.</p>
                </Card>
              </div>

              {/* Benefits Section */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Results That Change You</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">🔥 Torch Body Fat</h3>
                    <p className="opacity-90">The relentless pace of swings creates a calorie-burning furnace.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">💪 Build Explosive Strength</h3>
                    <p className="opacity-90">Target your posterior chain for unmatched power.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">⚡ Boost Endurance</h3>
                    <p className="opacity-90">Elevate your work capacity to perform stronger and longer.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">🧠 Cultivate Mental Toughness</h3>
                    <p className="opacity-90">Overcome limits and gain confidence beyond the gym.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="lg:w-96 p-6 lg:p-12 flex items-center">
            <Card className="w-full backdrop-blur-md bg-white/10 border-white/20 p-8">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                </h2>
                <p className="text-white/80">
                  {isLogin ? 'Sign in to continue your challenge' : 'Create your account to begin'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-100 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </Button>
              </form>

              <div className="my-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-transparent text-white/80">Or continue with</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                variant="outline"
                className="w-full bg-blue-800 border-blue-700 text-white hover:bg-blue-900"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-white/80 hover:text-white text-sm underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                </button>
              </div>

              {!isLogin && (
                <div className="mt-6 text-center">
                  <h3 className="text-lg font-semibold text-yellow-300 mb-2">Your Transformation Starts Now</h3>
                  <p className="text-white/80 text-sm">
                    No more waiting and no more excuses. The blueprint is here and the tool is ready. 
                    The only question left is: are you in?
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;