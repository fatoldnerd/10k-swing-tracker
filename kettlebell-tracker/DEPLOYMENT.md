# 10K Swing Tracker - Deployment Guide

## Prerequisites

1. **Node.js** (v18+)
2. **Firebase CLI** installed globally: `npm install -g firebase-tools`
3. **Firebase Project** created at [console.firebase.google.com](https://console.firebase.google.com)

## Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Name it "kettlebell-tracker" (or your preferred name)
4. Enable Google Analytics (optional)

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Start in "test mode" for now
4. Choose your region

### 3. Enable Firebase Hosting
1. Go to "Hosting" in Firebase Console
2. Click "Get started"
3. Follow the setup instructions

### 4. Get Firebase Configuration
1. Go to "Project Settings" (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" (</>) icon
4. Register your app with nickname "10k-swing-tracker"
5. Copy the configuration object

## Local Development Setup

### 1. Clone and Install Dependencies
```bash
cd kettlebell-tracker
npm install
```

### 2. Configure Environment Variables
1. Copy the Firebase config from Firebase Console
2. Update `.env.local` with your actual Firebase credentials:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
```

### 3. Initialize Firebase CLI
```bash
firebase login
firebase init
```

Select:
- ✅ Firestore
- ✅ Hosting
- Choose your existing project
- Use default settings or keep existing files

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000`

## Firebase Rules & Security

### Update Firestore Rules (Production)
For production, update `firestore.rules` with proper authentication:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all operations
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Deployment

### Option 1: Automatic Deployment
```bash
npm run deploy
```

This will:
1. Build the Next.js app for production
2. Deploy to Firebase Hosting

### Option 2: Manual Steps
```bash
# Build the app
npm run build

# Deploy to Firebase
firebase deploy
```

### Option 3: Deploy Specific Services
```bash
# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy everything
firebase deploy
```

## Environment-Specific Configurations

### Development
- Uses Firebase emulators (optional)
- Hot reloading enabled
- Debug mode active

### Production
- Static export optimized for Firebase Hosting
- Error boundaries for graceful error handling
- Performance optimizations enabled

## Performance Optimizations

The app includes several optimizations:
- **Static Site Generation** for fast loading
- **Code splitting** for smaller bundles
- **Image optimization** disabled for static export
- **Package optimization** for lucide-react and recharts
- **Caching headers** for static assets

## Monitoring & Analytics

Consider adding:
1. **Firebase Analytics** for user behavior tracking
2. **Firebase Performance Monitoring** for app performance
3. **Error reporting** with Firebase Crashlytics

## Security Considerations

1. **Firestore Rules**: Update rules for production use
2. **Environment Variables**: Never commit actual Firebase keys
3. **HTTPS**: Firebase Hosting provides automatic HTTPS
4. **Rate Limiting**: Consider implementing rate limits for API calls

## Troubleshooting

### Common Issues

**Build Errors**:
```bash
npm run type-check  # Check TypeScript errors
npm run lint        # Check ESLint errors
```

**Firebase Connection Issues**:
- Verify environment variables are correct
- Check Firebase project settings
- Ensure Firestore is enabled

**Deployment Failures**:
- Check Firebase CLI is logged in: `firebase login`
- Verify project is initialized: `firebase use --add`
- Check build output exists: `ls out/`

### Firebase Emulators (Development)
```bash
npm run firebase:emulators
```

This starts:
- Firestore emulator on `localhost:8080`
- Hosting emulator on `localhost:5000`
- Emulator UI on `localhost:4000`

## Support

For issues:
1. Check the [Firebase Documentation](https://firebase.google.com/docs)
2. Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
3. Check Firebase Console for error logs