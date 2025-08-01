# 10K Swing Tracker - Authentication Testing Guide

This guide will walk you through testing the authentication system before deployment.

## Prerequisites

1. **Firebase CLI**: Install globally if not already installed
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project**: Ensure you have a Firebase project with:
   - Authentication enabled (Email/Password + Google Sign-in)
   - Firestore database created
   - Web app configuration available

## Testing Setup Options

### Option 1: Local Testing with Firebase Emulators (Recommended)

This is the safest way to test without affecting your production Firebase data.

#### Step 1: Start Firebase Emulators
```bash
# In your project directory
npm run firebase:emulators
```

This will start:
- Auth Emulator on `http://localhost:9099`
- Firestore Emulator on `http://localhost:8080`
- Firebase UI on `http://localhost:4000`

#### Step 2: Start Development Server
```bash
# In another terminal
npm run dev
```

Your app will be available at `http://localhost:3000`

### Option 2: Testing with Real Firebase

#### Step 1: Configure Environment Variables
1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your Firebase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

3. To disable emulators and use real Firebase, add:
   ```env
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR_DISABLED=true
   ```

#### Step 2: Enable Authentication in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Authentication > Sign-in method
4. Enable "Email/Password" and "Google" providers

#### Step 3: Start Development Server
```bash
npm run dev
```

## Testing Checklist

### 📱 Landing Page Testing
- [ ] **Page Loads**: Landing page displays correctly
- [ ] **Responsive Design**: Test on mobile and desktop views
- [ ] **Form Toggle**: Switch between login and signup forms works
- [ ] **Input Validation**: Test empty fields, invalid emails, weak passwords
- [ ] **Error Display**: Proper error messages for invalid inputs

### 🔐 Authentication Testing

#### Email/Password Authentication
- [ ] **Signup Flow**: 
  - Create new account with valid email/password
  - Verify account creation success
  - Check user is redirected to dashboard
- [ ] **Login Flow**:
  - Login with existing credentials
  - Verify successful authentication
  - Check redirection to dashboard
- [ ] **Error Handling**:
  - Test wrong password
  - Test non-existent email
  - Test network errors (if using emulators, stop them mid-test)

#### Google Authentication
- [ ] **Google Signup**: Click "Continue with Google" and complete flow
- [ ] **Google Login**: Login with existing Google account
- [ ] **Popup Handling**: Verify popup opens and closes correctly

### 🛡️ Route Protection Testing
- [ ] **Unauthenticated Access**: 
  - Try accessing `/workout`, `/log`, `/history`, `/analytics`, `/achievements`
  - Verify redirection to landing page
- [ ] **Authenticated Access**:
  - Login and verify access to all protected routes
  - Check navigation menu appears
- [ ] **Session Persistence**:
  - Login, refresh page, verify still authenticated
  - Close and reopen browser tab, verify session maintained

### 👤 User-Specific Data Testing
- [ ] **Data Isolation**:
  - Create test workout with User A
  - Login as User B, verify they don't see User A's data
  - Login back as User A, verify their data is still there
- [ ] **Navigation Display**:
  - Verify user email shows in navigation
  - Test logout functionality
  - Verify navigation hides after logout

### 📊 Dashboard Functionality
- [ ] **Initial State**: Fresh user sees empty dashboard
- [ ] **Settings Creation**: User can set preferences
- [ ] **Achievement Initialization**: Achievements initialize for new users
- [ ] **Data Creation**: Can create workouts, challenges, etc.

### 🔄 Session Management
- [ ] **Login Persistence**: User stays logged in across page refreshes
- [ ] **Logout Function**: Logout button works and clears session
- [ ] **Auto-redirect**: Accessing protected routes while logged out redirects to landing
- [ ] **Auto-access**: Accessing landing page while logged in redirects to dashboard

## Common Issues & Solutions

### Emulator Connection Issues
- **Error**: "Failed to connect to emulator"
- **Solution**: Ensure emulators are running with `npm run firebase:emulators`

### Environment Variable Issues
- **Error**: "Using mock Firebase configuration"
- **Solution**: Check `.env.local` file exists and has correct values

### Authentication Popup Issues
- **Error**: Google sign-in popup blocked
- **Solution**: Allow popups in browser for localhost

### Build Errors
- **Error**: TypeScript compilation errors
- **Solution**: Run `npm run type-check` to identify issues

## Performance Testing

### Build Validation
```bash
# Test production build
npm run build
npm run start
```

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## Pre-Deployment Checklist

- [ ] All authentication flows tested and working
- [ ] User data properly isolated between accounts
- [ ] Security rules deployed and tested
- [ ] No TypeScript errors in build
- [ ] Environment variables configured for production
- [ ] Firebase project properly configured
- [ ] Google Sign-in domain authorized in Firebase Console

## Next Steps

Once testing is complete:
1. Deploy security rules: `firebase deploy --only firestore:rules`
2. Deploy to hosting: `npm run deploy`
3. Test production deployment with real users
4. Monitor Firebase Console for any errors

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console logs
3. Verify environment variables
4. Ensure all Firebase services are enabled