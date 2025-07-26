# CLAUDE.md
## Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 fitness tracking application for the 10,000 Swing Kettlebell Challenge. Users complete 20 workouts of 500 swings each, alternating with strength exercises. The app features real-time data synchronization with Firebase Firestore, glassmorphism UI design, and comprehensive progress tracking.

## Technical Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Database**: Google Firebase Firestore (NoSQL document database)
- **Styling**: Tailwind CSS v4 with custom animations and glassmorphism effects
- **UI Components**: shadcn/ui components
- **Firebase SDK**: Firebase v11+ for web
- **Icons**: Lucide React
- **Charts**: Recharts for analytics
- **Date Handling**: date-fns
- **State Management**: React hooks with Firebase real-time listeners

## Common Commands

### Development
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run Next.js linter
npm run type-check  # Run TypeScript type checking
```

### Firebase
```bash
firebase login      # Authenticate with Firebase
firebase init       # Initialize Firebase project
firebase deploy     # Deploy to Firebase Hosting
firebase emulators:start  # Start Firebase emulators for local development
```

## Architecture Overview

### Firebase Integration
The app uses Firebase Firestore as the primary database with real-time synchronization:

- **Real-time listeners**: Uses `onSnapshot` for live data updates across all components
- **Offline persistence**: Leverages Firebase's built-in offline support
- **Batch operations**: Saves workouts with associated rounds in atomic transactions
- **Security rules**: Configured for proper read/write access control

### Database Schema

#### Collections Structure
- **workouts**: Workout details (date, exercise type, weight, time, completion status, notes)
- **workout-rounds**: Individual round data (round number 1-5, time, parent workout reference)  
- **user-settings**: User preferences (preferred weight, challenge start date, target days)
- **challenges**: Challenge progress tracking (start/end dates, completion status)

#### Workout Round Structure
The challenge follows a specific 5-round format:
- Round 1: 10 swings + 5 strength exercises
- Round 2: 15 swings + 3 strength exercises  
- Round 3: 25 swings + 2 strength exercises
- Round 4: 50 swings (no strength)
- Round 5: Repeat of earlier rounds to reach 500 total swings

### Core Application Architecture

#### Page Structure (App Router)
- `/`: Dashboard with challenge progress and quick stats
- `/workout`: Interactive timer for active workouts
- `/log`: Manual workout logging form
- `/history`: Workout history with filtering and editing
- `/analytics`: Progress charts and performance insights
- `/achievements`: Achievement system with 10 different badges

#### Key Components
- **Timer System**: Complex multi-round timer with exercise transitions and pause/resume
- **Real-time Dashboard**: Live updates using Firebase listeners
- **Achievement Engine**: Tracks 10 different achievement criteria in real-time
- **Analytics Charts**: Uses Recharts with Firebase data for progress visualization

### UI/UX Design System

#### Visual Design
- **Glassmorphism effects**: Backdrop blur on all cards with white/transparent backgrounds
- **Animated gradients**: Shifting background colors with CSS animations
- **Color scheme**: Emerald to cyan, blue to purple, orange to red gradients
- **Responsive design**: Mobile-first approach with touch-friendly interactions

#### Animation Requirements
- **Counter animations** for statistics display
- **Progress bar animations** for workout completion
- **Page transition animations** between routes
- **Hover effects** on interactive elements

### Firebase Configuration

#### Environment Variables
Required environment variables for Firebase configuration:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

#### Firestore Security Rules
Configure rules for read/write access to collections with proper user authentication (when implemented).

#### Performance Optimization
- Set up proper indexes for efficient queries
- Minimize Firestore reads through query optimization
- Implement proper listener cleanup to prevent memory leaks

### Key Development Considerations

#### Data Operations
- All Firebase operations should include comprehensive error handling
- Use batch operations for saving workouts with associated rounds
- Implement data validation before saving to Firestore
- Handle offline scenarios gracefully

#### Achievement System Logic
The achievement system tracks 10 different criteria:
1. First Steps: Complete first workout
2. Consistency Rookie: Complete 5 workouts  
3. Speed Demon: Complete workout under 30 minutes
4. Weekly Warrior: Complete 4 workouts in one week
5. Streak Starter: Complete workouts on 3 consecutive days
6. Century Club: Complete 10 workouts
7. Swing Master: Complete 5,000 total swings
8. Versatile Athlete: Try all 5 different strength exercises
9. Endurance Champion: Complete full 20-workout challenge
10. Efficiency Expert: Complete workout under 25 minutes

#### Strength Exercises
The app supports 5 strength exercises that alternate with kettlebell swings:
- Dips
- Push-ups  
- Pull-ups
- Goblet Squats
- Military Press

### Deployment

#### Firebase Hosting
- Configure for Next.js standalone output
- Set up proper rewrites for the App Router
- Include Firebase functions configuration for server-side operations

#### Build Configuration
- Optimize for smooth animations and real-time updates
- Configure proper error boundaries for Firebase connection issues
- Set up TypeScript strict mode for better type safety