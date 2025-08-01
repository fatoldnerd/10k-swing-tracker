# Firebase Setup Checklist ✅

## Quick Reference for Real Firebase Setup

### 🔥 Firebase Console Tasks

**Project Setup:**
- [ ] Go to https://console.firebase.google.com/
- [ ] Create new project: `kettlebell-tracker-test`
- [ ] Skip Google Analytics

**Authentication:**
- [ ] Go to Authentication → Get started
- [ ] Sign-in method → Enable Email/Password
- [ ] Save changes

**Firestore Database:**
- [ ] Go to Firestore Database → Create database
- [ ] Start in test mode
- [ ] Choose default location

**App Configuration:**
- [ ] Project Settings (gear icon)
- [ ] Your apps → Web icon `</>`
- [ ] Register app: `10k-swing-tracker`
- [ ] Copy config object

### 💻 Local Development Tasks

**Environment Setup:**
- [ ] `cp .env.local.example .env.local`
- [ ] Replace all Firebase config values in `.env.local`
- [ ] Verify `NEXT_PUBLIC_USE_FIREBASE_EMULATOR_DISABLED=true` is set
- [ ] `npm run dev`

**Test Authentication:**
- [ ] Open http://localhost:3000
- [ ] Create user: `test1@example.com` / `TestPass123!`
- [ ] Logout and create: `test2@example.com` / `TestPass456!`
- [ ] Verify users can't see each other's data

### 🎯 Success Indicators

**Console Logs Should Show:**
- [ ] No emulator connection attempts
- [ ] No Java-related errors
- [ ] Successful Firebase initialization
- [ ] User authentication working

**App Functionality:**
- [ ] Landing page displays
- [ ] User signup works
- [ ] Login/logout works
- [ ] Dashboard loads after auth
- [ ] Users can create workouts
- [ ] Data isolation between users

**Firebase Console Should Show:**
- [ ] Users appear in Authentication tab
- [ ] Documents appear in Firestore tab
- [ ] Each document has `userId` field

### 🚨 Common Issues & Fixes

**"Invalid API key":**
- [ ] Check all values in `.env.local` match Firebase console exactly
- [ ] Restart dev server: `npm run dev`

**"Permission denied":**
- [ ] Ensure Firestore is in "test mode" (not production)
- [ ] Check Firebase console for any rule errors

**Users see each other's data:**
- [ ] Check browser console for JavaScript errors
- [ ] Verify `userId` field is being added to documents

### 📝 Config Template

```bash
# Your .env.local should look like:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBk1234567890abcdefghijklmnopqrstuv
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
NEXT_PUBLIC_USE_FIREBASE_EMULATOR_DISABLED=true
```

### ⏱️ Timeline

- **Firebase setup:** 3-5 minutes
- **Local setup:** 1-2 minutes  
- **Testing:** 5-10 minutes
- **Total:** ~10-15 minutes to working authentication

### 🎉 When Complete

You'll have:
- ✅ **Working user authentication** (signup, login, logout)
- ✅ **User data isolation** (each user sees only their data)
- ✅ **Session persistence** (login survives page refresh)
- ✅ **Route protection** (dashboard requires auth)
- ✅ **Real Firebase backend** (production-ready)
- ✅ **No emulator issues** (Java-free solution)